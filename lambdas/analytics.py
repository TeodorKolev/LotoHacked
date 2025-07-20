import csv
from datetime import datetime
from typing import List, Dict, Union
import boto3
from collections import Counter
from io import StringIO

# --- CONFIG ---
dynamodb = boto3.resource('dynamodb')

def stringify_keys(d):
    return {str(k): v for k, v in d.items()}

def read_csv_data_from_s3(bucket: str, key: str, env: str) -> List[Dict]:
    try:
        s3 = boto3.client('s3')
        print("S3 client created")
        obj = s3.get_object(Bucket=bucket, Key=key)
        print("S3 object fetched")
    except Exception as e:
        print(f"Error accessing S3: {e}")
        raise
    # Use different encoding based on environment
    encoding = 'iso-8859-1' if env == 'em' else 'utf-8'
    csv_content = obj['Body'].read().decode(encoding)
    print(f"Decoded CSV with encoding: {encoding}")
    reader = csv.DictReader(StringIO(csv_content), delimiter=';')
    data = []
    for row in reader:
        if env == "keno":
            # KENO has 20 numbers: boule1, boule2, ..., boule20
            row_data = {
                'date_de_tirage': row['date_de_tirage']
            }
            # Add all 20 boule numbers
            for i in range(1, 21):
                boule_key = f'boule{i}'
                row_data[f'boule_{i}'] = int(row[boule_key])
        else:
            # Standard 5-number lotteries
            row_data = {
                'boule_1': int(row['boule_1']),
                'boule_2': int(row['boule_2']),
                'boule_3': int(row['boule_3']),
                'boule_4': int(row['boule_4']),
                'boule_5': int(row['boule_5']),
                'date_de_tirage': row['date_de_tirage']
            }
            
            # Handle different lottery environments
            if env == "fdj":
                row_data['numero_chance'] = int(row['numero_chance'])
            elif env == "em":
                row_data['etoile_1'] = int(row['etoile_1'])
                row_data['etoile_2'] = int(row['etoile_2'])
            else:
                raise Exception(f"Unsupported environment: {env}")
            
        data.append(row_data)
    return data

# --- ANALYSIS FUNCTIONS ---
def categorize_number(number: int, max_number: int = 49) -> str:
    """Categorize number into color ranges"""
    if max_number == 70:  # KENO range
        if 1 <= number <= 10:
            return 'green'
        elif 11 <= number <= 20:
            return 'yellow'
        elif 21 <= number <= 30:
            return 'red'
        elif 31 <= number <= 40:
            return 'purple'
        elif 41 <= number <= 50:
            return 'blue'
        elif 51 <= number <= 60:
            return 'orange'
        elif 61 <= number <= 70:
            return 'pink'
        else:
            return 'out_of_range'
    else:  # Standard lottery range (1-49)
        if 1 <= number <= 10:
            return 'green'
        elif 11 <= number <= 20:
            return 'yellow'
        elif 21 <= number <= 30:
            return 'red'
        elif 31 <= number <= 40:
            return 'purple'
        elif 41 <= number <= 49:
            return 'blue'
        else:
            return 'out_of_range'

def analyze_patterns(data: List[Dict], max_number: int = 49) -> Dict:
    """Analyze color patterns in lottery draws"""
    patterns = []
    for row in data:
        if max_number == 70:  # KENO - 20 numbers
            numbers = sorted([row[f'boule_{i}'] for i in range(1, 21)])
        else:  # Standard lottery - 5 numbers
            numbers = sorted([row['boule_1'], row['boule_2'], row['boule_3'], row['boule_4'], row['boule_5']])
        colors = [categorize_number(n, max_number) for n in numbers]
        pattern = '-'.join(colors)
        patterns.append(pattern)
    
    pattern_counts = Counter(patterns)
    return {
        # 'patterns': patterns,
        'pattern_counts': dict(pattern_counts.most_common(10)),
        'total_patterns': len(patterns)
    }

def analyze_odd_even(data: List[Dict], max_number: int = 49) -> Dict:
    """Analyze odd/even distribution"""
    odd_even_counts = Counter()
    for row in data:
        if max_number == 70:  # KENO - 20 numbers
            numbers = [row[f'boule_{i}'] for i in range(1, 21)]
            total_numbers = 20
        else:  # Standard lottery - 5 numbers
            numbers = [row['boule_1'], row['boule_2'], row['boule_3'], row['boule_4'], row['boule_5']]
            total_numbers = 5
        
        odd_count = sum(1 for n in numbers if n % 2 == 1)
        even_count = total_numbers - odd_count
        pattern = f"{odd_count}_odd_{even_count}_even"
        odd_even_counts[pattern] += 1
    
    return dict(odd_even_counts)

def analyze_low_high(data: List[Dict], max_number: int = 49) -> Dict:
    """Analyze low/high distribution"""
    low_high_counts = Counter()
    for row in data:
        if max_number == 70:  # KENO - split at 35
            numbers = [row[f'boule_{i}'] for i in range(1, 21)]
            split_point = 35
            total_numbers = 20
        else:  # Standard lottery - split at 25
            numbers = [row['boule_1'], row['boule_2'], row['boule_3'], row['boule_4'], row['boule_5']]
            split_point = 25
            total_numbers = 5
        
        low_count = sum(1 for n in numbers if n <= split_point)
        high_count = total_numbers - low_count
        pattern = f"{low_count}_low_{high_count}_high"
        low_high_counts[pattern] += 1
    
    return dict(low_high_counts)

def analyze_consecutive(data: List[Dict], max_number: int = 49) -> Dict:
    """Analyze consecutive numbers"""
    consecutive_counts = Counter()
    for row in data:
        if max_number == 70:  # KENO - 20 numbers
            numbers = sorted([row[f'boule_{i}'] for i in range(1, 21)])
        else:  # Standard lottery - 5 numbers
            numbers = sorted([row['boule_1'], row['boule_2'], row['boule_3'], row['boule_4'], row['boule_5']])
        
        consecutive_count = 0
        for i in range(len(numbers) - 1):
            if numbers[i + 1] - numbers[i] == 1:
                consecutive_count += 1
        consecutive_counts[consecutive_count] += 1
    
    return dict(consecutive_counts)

def analyze_number_frequency(data: List[Dict], last_n: Union[int, None] = None, max_number: int = 49) -> Dict:
    """Analyze frequency of each number"""
    if last_n:
        data = data[-last_n:]
    
    number_counts = Counter()
    for row in data:
        numbers = [row['boule_1'], row['boule_2'], row['boule_3'], row['boule_4'], row['boule_5']]
        number_counts.update(numbers)
    
    # Fill in missing numbers with 0
    frequency_data = {}
    for i in range(1, max_number + 1):
        frequency_data[str(i)] = number_counts.get(i, 0)
    
    return frequency_data

def analyze_sums(data: List[Dict], max_number: int = 49) -> Dict:
    """Analyze sum distribution"""
    sum_counts = Counter()
    for row in data:
        if max_number == 70:  # KENO - 20 numbers
            total = sum(row[f'boule_{i}'] for i in range(1, 21))
        else:  # Standard lottery - 5 numbers
            total = row['boule_1'] + row['boule_2'] + row['boule_3'] + row['boule_4'] + row['boule_5']
        sum_counts[total] += 1
    
    return dict(sum_counts.most_common(10))

def analyze_pairs(data: List[Dict], max_number: int = 49) -> Dict:
    """Analyze number pair frequency"""
    pair_counts = Counter()
    for row in data:
        if max_number == 70:  # KENO - 20 numbers
            numbers = [row[f'boule_{i}'] for i in range(1, 21)]
        else:  # Standard lottery - 5 numbers
            numbers = [row['boule_1'], row['boule_2'], row['boule_3'], row['boule_4'], row['boule_5']]
        
        for i in range(len(numbers)):
            for j in range(i + 1, len(numbers)):
                pair = tuple(sorted([numbers[i], numbers[j]]))
                pair_counts[pair] += 1
    
    # Convert tuples to strings for JSON serialization
    return {f"{pair[0]},{pair[1]}": count for pair, count in pair_counts.most_common(10)}

def get_hot_cold_numbers(data: List[Dict], last_n: int = 20, max_number: int = 49) -> Dict:
    """Get hot and cold numbers"""
    recent_data = data[-last_n:]
    frequency = analyze_number_frequency(recent_data, last_n=last_n, max_number=max_number)
    
    # Sort by frequency
    sorted_freq = sorted(frequency.items(), key=lambda x: x[1], reverse=True)
    
    hot_numbers = [int(num) for num, freq in sorted_freq[:5]]
    cold_numbers = [int(num) for num, freq in sorted_freq[-5:]]
    
    return {
        'hot_numbers': hot_numbers,
        'cold_numbers': cold_numbers,
        'frequency_data': frequency
    }

def predict_next_pattern(data: List[Dict], max_number: int = 49) -> str:
    """Simple pattern prediction based on most recent pattern"""
    if not data:
        if max_number == 70:  # KENO - 20 numbers
            return "-".join(["green"] * 3 + ["yellow"] * 3 + ["red"] * 3 + ["purple"] * 3 + ["blue"] * 3 + ["orange"] * 3 + ["pink"] * 2)
        else:  # Standard lottery - 5 numbers
            return "green-yellow-red-purple-blue"
    
    # Get the most recent pattern
    recent_row = data[-1]
    if max_number == 70:  # KENO - 20 numbers
        numbers = sorted([recent_row[f'boule_{i}'] for i in range(1, 21)])
    else:  # Standard lottery - 5 numbers
        numbers = sorted([recent_row['boule_1'], recent_row['boule_2'], recent_row['boule_3'], recent_row['boule_4'], recent_row['boule_5']])
    colors = [categorize_number(n, max_number) for n in numbers]
    return '-'.join(colors)

def store_analytics_to_dynamodb(name, analytics_type, distribution, table_name):
    print(f"Storing {analytics_type} for {name} in DynamoDB.")
    table = dynamodb.Table(table_name)  # type: ignore[attr-defined]
    print(table)
    now = datetime.utcnow().isoformat() + "Z"
    item = {
        "name": name,
        "type": analytics_type,
        "distribution": distribution,
        "date_created": now,
        "date_updated": now
    }
    table.put_item(Item=item)
    print(f"Stored {analytics_type} for {name} in DynamoDB.")

# --- MAIN WORKFLOW ---
def lambda_handler(event, context):
      # Validate event exists
    if not event:
        raise Exception("Event is missing or empty")
    
    # Validate detail field exists
    if "detail" not in event:
        raise Exception("Event detail field is missing")
    
    detail = event.get("detail", {})
    
    # Validate detail is not empty
    if not detail:
        raise Exception("Event detail is empty")
    
    # Validate required fields exist in detail
    required_fields = ['S3_BUCKET', 'S3_KEY', 'ANALYTICS_TABLE', 'ENV', 'MAX_NUMBER', 'LAST_N']
    missing_fields = []
    
    for field in required_fields:
        if field not in detail or not detail.get(field):
            missing_fields.append(field)
    
    if missing_fields:
        raise Exception(f"Missing required fields in event detail: {', '.join(missing_fields)}")
    
    # Extract variables from the `detail` field
    S3_BUCKET = detail.get('S3_BUCKET')
    S3_KEY = detail.get('S3_KEY')
    ANALYTICS_TABLE = detail.get('ANALYTICS_TABLE')
    ENV = detail.get('ENV')
    MAX_NUMBER = detail.get('MAX_NUMBER')
    LAST_N = detail.get('LAST_N')

    # Example: Read data from S3
    data = read_csv_data_from_s3(S3_BUCKET, S3_KEY, ENV)

    # Pattern analysis
    pattern_analysis = analyze_patterns(data, MAX_NUMBER)
    pattern_counts = pattern_analysis['pattern_counts']
    store_analytics_to_dynamodb(ENV, "pattern_counts", pattern_counts, ANALYTICS_TABLE)

    # Odd/Even analysis
    odd_even = analyze_odd_even(data, MAX_NUMBER)
    store_analytics_to_dynamodb(ENV, "odd_even", odd_even, ANALYTICS_TABLE)

    # Low/High analysis
    low_high = analyze_low_high(data, MAX_NUMBER)
    store_analytics_to_dynamodb(ENV, "low_high", low_high, ANALYTICS_TABLE)

    # Consecutive analysis
    consecutive = analyze_consecutive(data, MAX_NUMBER)
    distribution = {str(k): v for k, v in consecutive.items()}  # keys as strings, values as numbers
    store_analytics_to_dynamodb(ENV, "consecutive_count", distribution, ANALYTICS_TABLE)

    # Frequency analysis
    frequency = analyze_number_frequency(data, None, max_number=MAX_NUMBER)
    store_analytics_to_dynamodb(ENV, "frequency_count", frequency, ANALYTICS_TABLE)

    # Sums analysis
    sums = analyze_sums(data, MAX_NUMBER)
    distribution = {str(k): v for k, v in sums.items()}  # keys as strings, values as numbers
    store_analytics_to_dynamodb(ENV, "sums", distribution, ANALYTICS_TABLE)

    # Pairs analysis
    pairs = analyze_pairs(data, MAX_NUMBER)
    store_analytics_to_dynamodb(ENV, "pairs_count", pairs, ANALYTICS_TABLE)

    # Hot/Cold analysis
    hot_cold = get_hot_cold_numbers(data, last_n=LAST_N, max_number=MAX_NUMBER)
    store_analytics_to_dynamodb(ENV, "hot_cold", {"hot": hot_cold["hot_numbers"], "cold": hot_cold["cold_numbers"]}, ANALYTICS_TABLE)

    # Pattern prediction
    pattern_prediction = predict_next_pattern(data, MAX_NUMBER)
    store_analytics_to_dynamodb(ENV, "pattern_prediction", pattern_prediction, ANALYTICS_TABLE)

    # Draws storage - use chunking only for KENO, single item for standard lotteries
    draws_distribution = []
    for row in data:
        if ENV == "keno":
            # KENO has 20 numbers, no special numbers
            draw = {
                'draw_date': row['date_de_tirage']
            }
            # Add all 20 boule numbers
            for i in range(1, 21):
                draw[f'b_{i}'] = row[f'boule_{i}']
        else:
            # Standard 5-number lotteries
            draw = {
                'b_1': row['boule_1'],
                'b_2': row['boule_2'],
                'b_3': row['boule_3'],
                'b_4': row['boule_4'],
                'b_5': row['boule_5'],
                'draw_date': row['date_de_tirage']
            }
            
            # Handle different lottery environments for special numbers
            if ENV == "fdj":
                draw['special'] = row['numero_chance']
                draw['spcials'] = [row['numero_chance']]
            elif ENV == "em":
                draw['special'] = row['etoile_1']  # Use first star as primary special
                draw['spcials'] = [row['etoile_1'], row['etoile_2']]
        
        draws_distribution.append(draw)
    
    if ENV == "keno":
        # KENO: Split into chunks to avoid DynamoDB 400KB limit
        chunk_size = 200
        total_draws = len(draws_distribution)
        total_chunks = (total_draws + chunk_size - 1) // chunk_size  # Ceiling division
        
        for chunk_index in range(total_chunks):
            start_idx = chunk_index * chunk_size
            end_idx = min(start_idx + chunk_size, total_draws)
            chunk_draws = draws_distribution[start_idx:end_idx]
            
            # Store each chunk with a unique type name
            chunk_type = f"draws_chunk_{chunk_index + 1}"
            store_analytics_to_dynamodb(ENV, chunk_type, chunk_draws, ANALYTICS_TABLE)
            print(f"Stored KENO chunk {chunk_index + 1}/{total_chunks} with {len(chunk_draws)} draws")
        
        # Store metadata about the chunks
        draws_metadata = {
            "total_draws": total_draws,
            "total_chunks": total_chunks,
            "chunk_size": chunk_size,
            "last_updated": datetime.utcnow().isoformat() + "Z"
        }
        store_analytics_to_dynamodb(ENV, "draws_metadata", draws_metadata, ANALYTICS_TABLE)
        print(f"KENO: Stored {total_draws} draws in {total_chunks} chunks")
    else:
        # Standard lotteries: Store all draws in single item (original behavior)
        store_analytics_to_dynamodb(ENV, "draws", draws_distribution, ANALYTICS_TABLE)
        print(f"Standard lottery: Stored {len(draws_distribution)} draws in single item")