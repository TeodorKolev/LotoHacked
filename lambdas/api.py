import json
import boto3
import os
import time
from collections import defaultdict
import decimal

# In-memory cache: {cache_key: (timestamp, response)}
CACHE = {}
CACHE_TTL = 3600  # 1 hour in seconds
ANALYTICS_TABLE = os.environ.get('ANALYTICS_TABLE')
LOTTERY_TABLE = os.environ.get('LOTTERY_TABLE')
dynamodb = boto3.resource('dynamodb')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            # Convert to int if possible, else float
            if obj % 1 == 0:
                return int(obj)
            else:
                return float(obj)
        return super(DecimalEncoder, self).default(obj)

def cache_get(key):
    now = time.time()
    if key in CACHE:
        ts, value = CACHE[key]
        if now - ts < CACHE_TTL:
            return value
        else:
            del CACHE[key]
    return None

def cache_set(key, value):
    CACHE[key] = (time.time(), value)

def lambda_handler(event, context):
    path = event.get('path') or event.get('rawPath', '')
    method = event.get('requestContext', {}).get('http', {}).get('method', 'GET')
    params = event.get('queryStringParameters') or {}
    response = {'statusCode': 404, 'body': json.dumps({'error': 'Not found'})}
    
    # /{name}/all
    if method == 'GET' and path.count('/') == 2 and path.endswith('/all'):
        name = path.split('/')[1]
        cache_key = f"{name}_all"
        cached = cache_get(cache_key)
        if cached:
            return cached
        table = dynamodb.Table(ANALYTICS_TABLE)  # type: ignore[attr-defined]
        # Fetch all analytics types for this name (excluding draws which is handled separately)
        analytics_types = [
            'pattern_counts', 'odd_even', 'low_high', 'consecutive_count',
            'frequency_count', 'sums', 'pairs_count', 'hot_cold', 'pattern_prediction'
        ]
        result = {}
        for t in analytics_types:
            item = table.get_item(Key={'name': name, 'type': t}).get('Item')
            if item:
                # Remove date_created, date_updated, last_draw_date if present
                filtered = {k: v for k, v in item.items() if k not in ['date_created', 'date_updated', 'last_draw_date', 'name', 'type']}
                result[t] = filtered.get('distribution', filtered)
        
        # Handle draws - chunked for KENO, single item for standard lotteries
        draws_metadata_item = table.get_item(Key={'name': name, 'type': 'draws_metadata'}).get('Item')
        if draws_metadata_item:
            # KENO: Handle chunked draws
            total_chunks = draws_metadata_item.get('distribution', {}).get('total_chunks', 0)
            all_draws = []
            
            for chunk_num in range(1, total_chunks + 1):
                chunk_item = table.get_item(Key={'name': name, 'type': f'draws_chunk_{chunk_num}'}).get('Item')
                if chunk_item:
                    chunk_draws = chunk_item.get('distribution', [])
                    all_draws.extend(chunk_draws)
            
            result['draws'] = all_draws
        else:
            # Standard lotteries: single draws item
            draws_item = table.get_item(Key={'name': name, 'type': 'draws'}).get('Item')
            if draws_item:
                filtered = {k: v for k, v in draws_item.items() if k not in ['date_created', 'date_updated', 'last_draw_date', 'name', 'type']}
                result['draws'] = filtered.get('distribution', filtered)
        resp = {'statusCode': 200, 'body': json.dumps(result, cls=DecimalEncoder)}
        cache_set(cache_key, resp)
        return resp

    # /{name}/last_n
    if method == 'GET' and path.count('/') == 2 and path.endswith('/last_n'):
        name = path.split('/')[1]
        n = int(params.get('n', 50))
        cache_key = f"{name}_last_n_{n}"
        cached = cache_get(cache_key)
        if cached:
            return cached
        table = dynamodb.Table(ANALYTICS_TABLE)  # type: ignore[attr-defined]
        # Get all draws - chunked for KENO, single item for standard lotteries
        draws_metadata_item = table.get_item(Key={'name': name, 'type': 'draws_metadata'}).get('Item')
        all_draws = []
        
        if draws_metadata_item:
            # KENO: Get draws from chunks
            total_chunks = draws_metadata_item.get('distribution', {}).get('total_chunks', 0)
            
            for chunk_num in range(1, total_chunks + 1):
                chunk_item = table.get_item(Key={'name': name, 'type': f'draws_chunk_{chunk_num}'}).get('Item')
                if chunk_item:
                    chunk_draws = chunk_item.get('distribution', [])
                    all_draws.extend(chunk_draws)
        else:
            # Standard lotteries: single draws item
            draws = table.get_item(Key={'name': name, 'type': 'draws'}).get('Item', {})
            all_draws = draws.get('distribution', [])
        
        # Sort by draw_date descending, return last n
        sorted_draws = sorted(all_draws, key=lambda d: d.get('draw_date', ''), reverse=True)[:n]
        resp = {'statusCode': 200, 'body': json.dumps({'draws': sorted_draws})}
        cache_set(cache_key, resp)
        return resp

    # /{name}/heatmap/last_n
    if method == 'GET' and path.count('/') == 3 and path.endswith('/heatmap/last_n'):
        name = path.split('/')[1]
        n = int(params.get('n', 50))
        cache_key = f"{name}_heatmap_last_n_{n}"
        cached = cache_get(cache_key)
        if cached:
            return cached
        table = dynamodb.Table(ANALYTICS_TABLE)  # type: ignore[attr-defined]
        # Get all draws - chunked for KENO, single item for standard lotteries
        draws_metadata_item = table.get_item(Key={'name': name, 'type': 'draws_metadata'}).get('Item')
        all_draws = []
        
        if draws_metadata_item:
            # KENO: Get draws from chunks
            total_chunks = draws_metadata_item.get('distribution', {}).get('total_chunks', 0)
            
            for chunk_num in range(1, total_chunks + 1):
                chunk_item = table.get_item(Key={'name': name, 'type': f'draws_chunk_{chunk_num}'}).get('Item')
                if chunk_item:
                    chunk_draws = chunk_item.get('distribution', [])
                    all_draws.extend(chunk_draws)
        else:
            # Standard lotteries: single draws item
            draws = table.get_item(Key={'name': name, 'type': 'draws'}).get('Item', {})
            all_draws = draws.get('distribution', [])
        
        sorted_draws = sorted(all_draws, key=lambda d: d.get('draw_date', ''), reverse=True)[:n]
        # Calculate heatmap: count frequency of each number
        heatmap = defaultdict(int)
        for draw in sorted_draws:
            # Check if this is KENO (has b_20) or standard lottery (has b_5)
            if 'b_20' in draw:  # KENO - 20 numbers
                for k in [f'b_{i}' for i in range(1, 21)]:
                    if k in draw:
                        heatmap[str(draw[k])] += 1
            else:  # Standard lottery - 5 numbers
                for k in ['b_1', 'b_2', 'b_3', 'b_4', 'b_5']:
                    if k in draw:
                        heatmap[str(draw[k])] += 1
        resp = {'statusCode': 200, 'body': json.dumps({'heatmap': dict(heatmap)})}
        cache_set(cache_key, resp)
        return resp

    # /lottery
    if method == 'GET' and path.endswith('/lottery'):
        cache_key = 'lottery_list'
        cached = cache_get(cache_key)
        if cached:
            return cached
        table = dynamodb.Table(LOTTERY_TABLE)  # type: ignore[attr-defined]
        # Scan all lotteries
        items = table.scan().get('Items', [])
        result = [
            {
                'name': i.get('name'),
                'display_name': i.get('display_name'),
                'description': i.get('description'),
                'last_draw_date': i.get('last_draw_date')
            }
            for i in items
        ]
        resp = {'statusCode': 200, 'body': json.dumps(result)}
        cache_set(cache_key, resp)
        return resp

    return response 