#!/usr/bin/env python3
"""
Simple Sentiment Analysis Benchmarking Script
Uses only sentiment140.csv file for benchmarking VADER, TextBlob, and BERT models
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.benchmarking.simple_datasets import Sentiment140Loader
from backend.benchmarking.evaluator import SentimentEvaluator
import json
from datetime import datetime

def run_simple_benchmark(filepath: str = "sentiment140.csv", sample_size: int = 1000, models: list = None):
    """
    Run benchmarking on sentiment140.csv file
    
    Args:
        filepath: Path to sentiment140.csv file
        sample_size: Number of samples to use (None for all)
        models: List of models to evaluate (default: all)
    """
    print("🎯 SENTIMENT140 BENCHMARKING")
    print("=" * 50)
    print(f"File: {filepath}")
    print(f"Sample size: {sample_size if sample_size else 'All'}")
    print(f"Models: {models or ['vader', 'textblob', 'bert']}")
    print("=" * 50)
    
    try:
        # Load dataset
        print("\n📖 Loading Sentiment140 dataset...")
        dataset = Sentiment140Loader.load_sentiment140(filepath, sample_size)
        
        # Run evaluation
        print(f"\n🔬 Running sentiment analysis evaluation...")
        evaluator = SentimentEvaluator()
        results = evaluator.compare_models(dataset, models)
        
        # Generate report
        print(f"\n📊 GENERATING REPORT")
        print("=" * 30)
        report = evaluator.generate_report(results)
        print(report)
        
        # Save results as text file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"sentiment140_benchmark_{timestamp}.txt"
        
        with open(filename, 'w') as f:
            f.write("SENTIMENT140 BENCHMARK RESULTS\n")
            f.write("=" * 50 + "\n\n")
            f.write(f"Timestamp: {datetime.now().isoformat()}\n")
            f.write(f"File: {filepath}\n")
            f.write(f"Sample Size: {sample_size if sample_size else 'All'}\n")
            f.write(f"Models: {models or ['vader', 'textblob', 'bert']}\n\n")
            
            f.write("DETAILED RESULTS:\n")
            f.write("-" * 20 + "\n")
            f.write(report)
            
            if 'comparison' in results:
                f.write("\n\nWINNER SUMMARY:\n")
                f.write("-" * 15 + "\n")
                comparison = results['comparison']
                f.write(f"Best Accuracy: {comparison['best_accuracy']['model'].upper()} ({comparison['best_accuracy']['score']:.3f})\n")
                f.write(f"Best F1-Score: {comparison['best_f1']['model'].upper()} ({comparison['best_f1']['score']:.3f})\n")
                
                f.write("\nMODEL RANKINGS:\n")
                f.write("-" * 15 + "\n")
                for i, rank in enumerate(comparison['model_rankings']['by_accuracy'], 1):
                    f.write(f"{i}. {rank['model'].upper()}: {rank['score']:.3f}\n")
        
        print(f"\n💾 Results saved to: {filename}")
        
        # Print summary
        if 'comparison' in results:
            comparison = results['comparison']
            print(f"\n🏆 WINNER SUMMARY:")
            print("=" * 20)
            print(f"Best Accuracy: {comparison['best_accuracy']['model'].upper()} ({comparison['best_accuracy']['score']:.3f})")
            print(f"Best F1-Score: {comparison['best_f1']['model'].upper()} ({comparison['best_f1']['score']:.3f})")
            
            print(f"\n📈 Model Rankings:")
            for i, rank in enumerate(comparison['model_rankings']['by_accuracy'], 1):
                print(f"  {i}. {rank['model'].upper()}: {rank['score']:.3f}")
        
        return results
        
    except Exception as e:
        print(f"❌ Error during benchmarking: {e}")
        return None

def quick_test(filepath: str = "sentiment140.csv"):
    """Run a quick test with 100 samples"""
    print("🚀 QUICK TEST (100 samples)")
    print("=" * 30)
    return run_simple_benchmark(filepath, 100, ['vader', 'textblob'])

def full_benchmark(filepath: str = "sentiment140.csv", sample_size: int = 1000):
    """Run full benchmark with all models"""
    print("🔬 FULL BENCHMARK")
    print("=" * 30)
    return run_simple_benchmark(filepath, sample_size, ['vader', 'textblob', 'bert'])

def compare_sample_sizes(filepath: str = "sentiment140.csv"):
    """Compare performance across different sample sizes"""
    print("📊 SAMPLE SIZE COMPARISON")
    print("=" * 40)
    
    sample_sizes = [100, 500, 1000, 2000]
    all_results = {}
    
    for size in sample_sizes:
        print(f"\n--- Testing with {size} samples ---")
        try:
            results = run_simple_benchmark(filepath, size, ['vader', 'textblob'])
            if results and 'comparison' in results:
                best_model = results['comparison']['best_accuracy']['model']
                best_score = results['comparison']['best_accuracy']['score']
                all_results[size] = {
                    'best_model': best_model,
                    'best_accuracy': best_score
                }
                print(f"✅ {size} samples: {best_model.upper()} wins with {best_score:.3f}")
        except Exception as e:
            print(f"❌ Error with {size} samples: {e}")
    
    # Print comparison summary
    print(f"\n📈 SAMPLE SIZE COMPARISON SUMMARY:")
    print("=" * 40)
    for size, result in all_results.items():
        print(f"{size:4d} samples: {result['best_model'].upper()} ({result['best_accuracy']:.3f})")
    
    return all_results

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Benchmark sentiment analysis models on Sentiment140 dataset')
    parser.add_argument('--file', default='sentiment140.csv', help='Path to sentiment140.csv file')
    parser.add_argument('--sample-size', type=int, default=1000, help='Number of samples to use')
    parser.add_argument('--models', nargs='+', choices=['vader', 'textblob', 'bert'],
                       default=['vader', 'textblob', 'bert'], help='Models to evaluate')
    parser.add_argument('--quick', action='store_true', help='Run quick test with 100 samples')
    parser.add_argument('--compare-sizes', action='store_true', help='Compare different sample sizes')
    
    args = parser.parse_args()
    
    if args.quick:
        quick_test(args.file)
    elif args.compare_sizes:
        compare_sample_sizes(args.file)
    else:
        run_simple_benchmark(args.file, args.sample_size, args.models)

if __name__ == "__main__":
    main() 