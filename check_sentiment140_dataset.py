#!/usr/bin/env python3
"""
Script to check and validate the downloaded sentiment140.csv file
"""

import pandas as pd
import os
import sys
from typing import Dict, List, Tuple

def check_sentiment140_file(filepath: str = "sentiment140.csv") -> Dict:
    """
    Check if the sentiment140.csv file is valid for benchmarking
    
    Args:
        filepath: Path to the sentiment140.csv file
    
    Returns:
        Dictionary with validation results
    """
    results = {
        'file_exists': False,
        'file_size': 0,
        'total_rows': 0,
        'columns': [],
        'column_info': {},
        'label_distribution': {},
        'sample_texts': [],
        'is_valid': False,
        'issues': [],
        'recommendations': []
    }
    
    print("🔍 CHECKING SENTIMENT140 DATASET")
    print("=" * 50)
    
    # Check if file exists
    if not os.path.exists(filepath):
        results['issues'].append(f"File not found: {filepath}")
        print(f"❌ File not found: {filepath}")
        return results
    
    results['file_exists'] = True
    results['file_size'] = os.path.getsize(filepath) / (1024 * 1024)  # MB
    
    print(f"✅ File found: {filepath}")
    print(f"📁 File size: {results['file_size']:.2f} MB")
    
    try:
        # Try to read the CSV file
        print("\n📖 Reading CSV file...")
        
        # Try different encodings
        encodings = ['utf-8', 'latin-1', 'cp1252']
        df = None
        
        for encoding in encodings:
            try:
                df = pd.read_csv(filepath, encoding=encoding, nrows=1000)  # Read first 1000 rows to check
                print(f"✅ Successfully read with {encoding} encoding")
                break
            except UnicodeDecodeError:
                continue
        
        if df is None:
            results['issues'].append("Could not read file with any encoding")
            print("❌ Could not read file with any encoding")
            return results
        
        # Get basic info
        results['total_rows'] = len(df)
        results['columns'] = list(df.columns)
        
        print(f"📊 Total rows: {results['total_rows']}")
        print(f"📋 Columns: {results['columns']}")
        
        # Check column structure
        print(f"\n🔍 Column Analysis:")
        for i, col in enumerate(df.columns):
            col_info = {
                'index': i,
                'dtype': str(df[col].dtype),
                'unique_values': df[col].nunique(),
                'sample_values': df[col].dropna().head(3).tolist()
            }
            results['column_info'][col] = col_info
            
            print(f"  Column {i}: '{col}' ({col_info['dtype']})")
            print(f"    Unique values: {col_info['unique_values']}")
            print(f"    Sample values: {col_info['sample_values']}")
        
        # Identify text and label columns
        text_col = None
        label_col = None
        
        # Look for text column (usually contains the tweet text)
        for col in df.columns:
            if any(keyword in col.lower() for keyword in ['text', 'tweet', 'message', 'content']):
                text_col = col
                break
        
        # If no obvious text column, look for the longest string column
        if text_col is None:
            for col in df.columns:
                if df[col].dtype == 'object':
                    avg_length = df[col].astype(str).str.len().mean()
                    if avg_length > 50:  # Likely text if average length > 50 chars
                        text_col = col
                        break
        
        # Look for label column (usually first column or contains sentiment/polarity)
        for col in df.columns:
            if any(keyword in col.lower() for keyword in ['sentiment', 'polarity', 'label', 'class']):
                label_col = col
                break
        
        # If no obvious label column, assume first column
        if label_col is None:
            label_col = df.columns[0]
        
        print(f"\n🎯 Identified columns:")
        print(f"  Text column: {text_col}")
        print(f"  Label column: {label_col}")
        
        # Validate text column
        if text_col:
            text_samples = df[text_col].dropna().head(5).tolist()
            results['sample_texts'] = text_samples
            
            print(f"\n📝 Sample texts:")
            for i, text in enumerate(text_samples, 1):
                print(f"  {i}. {text[:100]}{'...' if len(text) > 100 else ''}")
        
        # Validate label column
        if label_col:
            label_counts = df[label_col].value_counts()
            results['label_distribution'] = label_counts.to_dict()
            
            print(f"\n🏷️ Label distribution:")
            for label, count in label_counts.items():
                percentage = (count / len(df)) * 100
                print(f"  {label}: {count} ({percentage:.1f}%)")
        
        # Check for common Sentiment140 format
        is_sentiment140_format = False
        if len(df.columns) >= 6:
            # Sentiment140 format: [polarity, id, date, query, user, text]
            first_col_values = df.iloc[:, 0].unique()
            if set(first_col_values).issubset({0, 2, 4}):
                is_sentiment140_format = True
                print(f"\n✅ Detected Sentiment140 format!")
                print(f"   Polarity values: {sorted(first_col_values)}")
                print(f"   (0=negative, 2=neutral, 4=positive)")
        
        # Validation checks
        validation_passed = True
        
        # Check 1: Has text data
        if not text_col or df[text_col].isna().all():
            results['issues'].append("No valid text column found")
            validation_passed = False
        
        # Check 2: Has label data
        if not label_col or df[label_col].isna().all():
            results['issues'].append("No valid label column found")
            validation_passed = False
        
        # Check 3: Has reasonable number of samples
        if len(df) < 100:
            results['issues'].append(f"Too few samples: {len(df)} (need at least 100)")
            validation_passed = False
        
        # Check 4: Has balanced labels (roughly)
        if label_col:
            label_counts = df[label_col].value_counts()
            min_count = label_counts.min()
            max_count = label_counts.max()
            if min_count / max_count < 0.1:  # Less than 10% of majority class
                results['issues'].append("Severely imbalanced labels")
                results['recommendations'].append("Consider balancing the dataset")
        
        # Check 5: Text length is reasonable
        if text_col:
            text_lengths = df[text_col].astype(str).str.len()
            avg_length = text_lengths.mean()
            if avg_length < 10:
                results['issues'].append("Texts are too short (average < 10 characters)")
            elif avg_length > 1000:
                results['issues'].append("Texts are very long (average > 1000 characters)")
        
        results['is_valid'] = validation_passed
        
        if validation_passed:
            print(f"\n✅ DATASET IS VALID FOR BENCHMARKING!")
            results['recommendations'].append("Ready to use for sentiment analysis benchmarking")
        else:
            print(f"\n❌ DATASET HAS ISSUES:")
            for issue in results['issues']:
                print(f"  • {issue}")
        
        # Additional recommendations
        if len(df) > 10000:
            results['recommendations'].append("Large dataset - consider sampling for faster testing")
        
        if is_sentiment140_format:
            results['recommendations'].append("Standard Sentiment140 format detected - good for comparison")
        
        print(f"\n💡 Recommendations:")
        for rec in results['recommendations']:
            print(f"  • {rec}")
        
        return results
        
    except Exception as e:
        results['issues'].append(f"Error reading file: {str(e)}")
        print(f"❌ Error reading file: {e}")
        return results

def create_benchmark_ready_dataset(filepath: str = "sentiment140.csv", output_file: str = "sentiment140_clean.csv"):
    """
    Create a clean, benchmark-ready version of the dataset
    
    Args:
        filepath: Path to original sentiment140.csv
        output_file: Path to save cleaned dataset
    """
    print(f"\n🧹 CREATING CLEAN DATASET")
    print("=" * 30)
    
    try:
        # Read the file
        df = pd.read_csv(filepath, encoding='latin-1')
        
        # Handle Sentiment140 format
        if len(df.columns) >= 6:
            # Standard Sentiment140 format: [polarity, id, date, query, user, text]
            df_clean = pd.DataFrame({
                'text': df.iloc[:, 5],  # 6th column (index 5) is text
                'polarity': df.iloc[:, 0]  # 1st column (index 0) is polarity
            })
            
            # Convert polarity to labels
            polarity_map = {0: 'negative', 2: 'neutral', 4: 'positive'}
            df_clean['label'] = df_clean['polarity'].map(polarity_map)
            
            # Remove neutral for binary classification
            df_clean = df_clean[df_clean['label'] != 'neutral']
            
            # Clean text
            df_clean['text'] = df_clean['text'].astype(str).str.strip()
            df_clean = df_clean[df_clean['text'].str.len() > 10]  # Remove very short texts
            
            # Save clean dataset
            df_clean = df_clean[['text', 'label']].reset_index(drop=True)
            df_clean.to_csv(output_file, index=False)
            
            print(f"✅ Clean dataset saved to: {output_file}")
            print(f"📊 Clean dataset stats:")
            print(f"  Total samples: {len(df_clean)}")
            print(f"  Label distribution:")
            label_counts = df_clean['label'].value_counts()
            for label, count in label_counts.items():
                percentage = (count / len(df_clean)) * 100
                print(f"    {label}: {count} ({percentage:.1f}%)")
            
            return df_clean
            
        else:
            print("❌ Unexpected file format")
            return None
            
    except Exception as e:
        print(f"❌ Error creating clean dataset: {e}")
        return None

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Check and validate sentiment140.csv file')
    parser.add_argument('--file', default='sentiment140.csv', help='Path to sentiment140.csv file')
    parser.add_argument('--clean', action='store_true', help='Create clean benchmark-ready dataset')
    
    args = parser.parse_args()
    
    # Check the file
    results = check_sentiment140_file(args.file)
    
    # Create clean dataset if requested
    if args.clean and results['is_valid']:
        create_benchmark_ready_dataset(args.file)
    
    # Summary
    print(f"\n📋 SUMMARY:")
    print("=" * 20)
    print(f"File valid: {'✅ Yes' if results['is_valid'] else '❌ No'}")
    print(f"Total samples: {results['total_rows']}")
    print(f"File size: {results['file_size']:.2f} MB")
    
    if results['is_valid']:
        print(f"\n🎯 Ready for benchmarking!")
        print(f"Run: python benchmark_sentiment_models.py --dataset sentiment140 --sample-size 500")
    else:
        print(f"\n🔧 Fix issues before benchmarking")

if __name__ == "__main__":
    main() 