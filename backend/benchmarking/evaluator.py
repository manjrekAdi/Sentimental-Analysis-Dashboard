import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scrapers.reddit_scraper import RedditAPIScraper
from .simple_datasets import SimpleDataset

class SentimentEvaluator:
    """Evaluator for comparing sentiment analysis models"""
    
    def __init__(self):
        # Initialize the sentiment analysis models
        self.scraper = RedditAPIScraper(
            client_id="dummy",  # Not used for evaluation
            client_secret="dummy",
            username="dummy",
            password="dummy",
            user_agent="dummy"
        )
    
    def evaluate_model_on_dataset(self, dataset: SimpleDataset, model_name: str) -> Dict[str, Any]:
        """
        Evaluate a specific model on a dataset
        
        Args:
            dataset: SentimentDataset object
            model_name: 'vader', 'textblob', or 'bert'
        
        Returns:
            Dictionary containing evaluation metrics
        """
        texts = dataset.get_texts()
        true_labels = dataset.get_labels()
        predicted_labels = []
        confidence_scores = []
        
        for text in texts:
            if model_name == 'vader':
                scores = self.scraper.vader.polarity_scores(text)
                predicted_labels.append('positive' if scores['compound'] > 0.05 else 'negative')
                confidence_scores.append(abs(scores['compound']))
            
            elif model_name == 'textblob':
                from textblob import TextBlob
                blob = TextBlob(text)
                polarity = blob.sentiment.polarity
                predicted_labels.append('positive' if polarity > 0.05 else 'negative')
                confidence_scores.append(abs(polarity))
            
            elif model_name == 'bert':
                try:
                    result = self.scraper.bert_sentiment(text)[0]
                    # Convert BERT labels to binary
                    bert_label = result['label'].lower()
                    if bert_label == 'positive':
                        predicted_labels.append('positive')
                    else:
                        predicted_labels.append('negative')
                    confidence_scores.append(result['score'])
                except Exception as e:
                    print(f"BERT error on text: {e}")
                    predicted_labels.append('negative')  # Default to negative instead of neutral
                    confidence_scores.append(0.5)
        
        # Calculate metrics
        metrics = self._calculate_metrics(true_labels, predicted_labels, confidence_scores)
        metrics['model'] = model_name
        metrics['dataset'] = dataset.name
        metrics['total_samples'] = len(texts)
        
        return metrics
    
    def _calculate_metrics(self, true_labels: List[str], predicted_labels: List[str], confidence_scores: List[float]) -> Dict[str, Any]:
        """Calculate evaluation metrics"""
        
        # For binary classification, all labels are either positive or negative
        binary_true = true_labels
        binary_pred = predicted_labels
        
        # Overall accuracy
        accuracy = accuracy_score(true_labels, predicted_labels)
        
        # Binary accuracy (excluding neutral)
        binary_accuracy = accuracy_score(binary_true, binary_pred) if binary_true else 0
        
        # Precision, recall, F1 for each class
        precision, recall, f1, support = precision_recall_fscore_support(
            true_labels, predicted_labels, average=None, labels=['positive', 'negative']
        )
        
        # Macro and weighted averages
        macro_precision, macro_recall, macro_f1, _ = precision_recall_fscore_support(
            true_labels, predicted_labels, average='macro'
        )
        
        weighted_precision, weighted_recall, weighted_f1, _ = precision_recall_fscore_support(
            true_labels, predicted_labels, average='weighted'
        )
        
        # Binary metrics (positive vs negative only)
        if binary_true and len(set(binary_true)) > 1:
            binary_precision, binary_recall, binary_f1, _ = precision_recall_fscore_support(
                binary_true, binary_pred, average='binary', pos_label='positive'
            )
        else:
            binary_precision, binary_recall, binary_f1 = 0, 0, 0
        
        # Confidence statistics
        avg_confidence = np.mean(confidence_scores) if confidence_scores else 0
        std_confidence = np.std(confidence_scores) if confidence_scores else 0
        
        # Confusion matrix
        cm = confusion_matrix(true_labels, predicted_labels, labels=['positive', 'negative'])
        
        return {
            'accuracy': accuracy,
            'binary_accuracy': binary_accuracy,
            'precision': precision.tolist(),
            'recall': recall.tolist(),
            'f1': f1.tolist(),
            'support': support.tolist(),
            'macro_precision': macro_precision,
            'macro_recall': macro_recall,
            'macro_f1': macro_f1,
            'weighted_precision': weighted_precision,
            'weighted_recall': weighted_recall,
            'weighted_f1': weighted_f1,
            'binary_precision': binary_precision,
            'binary_recall': binary_recall,
            'binary_f1': binary_f1,
            'avg_confidence': avg_confidence,
            'std_confidence': std_confidence,
            'confusion_matrix': cm.tolist(),
            'class_labels': ['positive', 'negative']
        }
    
    def compare_models(self, dataset: SimpleDataset, models: List[str] = None) -> Dict[str, Any]:
        """
        Compare multiple models on the same dataset
        
        Args:
            dataset: SentimentDataset object
            models: List of model names to compare (default: all models)
        
        Returns:
            Dictionary containing comparison results
        """
        if models is None:
            models = ['vader', 'textblob', 'bert']
        
        results = {}
        for model in models:
            print(f"Evaluating {model.upper()} on {dataset.name}...")
            results[model] = self.evaluate_model_on_dataset(dataset, model)
        
        # Add comparison summary
        comparison = self._create_comparison_summary(results)
        results['comparison'] = comparison
        
        return results
    
    def _create_comparison_summary(self, results: Dict[str, Dict]) -> Dict[str, Any]:
        """Create a summary comparing all models"""
        
        summary = {
            'best_accuracy': {'model': None, 'score': 0},
            'best_f1': {'model': None, 'score': 0},
            'best_binary_accuracy': {'model': None, 'score': 0},
            'model_rankings': {}
        }
        
        # Find best models for different metrics
        for model, metrics in results.items():
            if metrics['accuracy'] > summary['best_accuracy']['score']:
                summary['best_accuracy'] = {'model': model, 'score': metrics['accuracy']}
            
            if metrics['macro_f1'] > summary['best_f1']['score']:
                summary['best_f1'] = {'model': model, 'score': metrics['macro_f1']}
            
            if metrics['binary_accuracy'] > summary['best_binary_accuracy']['score']:
                summary['best_binary_accuracy'] = {'model': model, 'score': metrics['binary_accuracy']}
        
        # Create rankings
        accuracy_ranking = sorted(results.items(), key=lambda x: x[1]['accuracy'], reverse=True)
        f1_ranking = sorted(results.items(), key=lambda x: x[1]['macro_f1'], reverse=True)
        binary_accuracy_ranking = sorted(results.items(), key=lambda x: x[1]['binary_accuracy'], reverse=True)
        
        summary['model_rankings'] = {
            'by_accuracy': [{'model': model, 'score': metrics['accuracy']} for model, metrics in accuracy_ranking],
            'by_f1': [{'model': model, 'score': metrics['macro_f1']} for model, metrics in f1_ranking],
            'by_binary_accuracy': [{'model': model, 'score': metrics['binary_accuracy']} for model, metrics in binary_accuracy_ranking]
        }
        
        return summary
    
    def generate_report(self, results: Dict[str, Any]) -> str:
        """Generate a human-readable evaluation report"""
        
        report = []
        report.append("=" * 60)
        report.append("SENTIMENT ANALYSIS MODEL EVALUATION REPORT")
        report.append("=" * 60)
        report.append("")
        
        # Dataset info
        if results:
            first_model = list(results.keys())[0]
            if first_model != 'comparison':
                dataset_name = results[first_model]['dataset']
                total_samples = results[first_model]['total_samples']
                report.append(f"Dataset: {dataset_name}")
                report.append(f"Total Samples: {total_samples}")
                report.append("")
        
        # Individual model results
        for model_name, metrics in results.items():
            if model_name == 'comparison':
                continue
                
            report.append(f"{model_name.upper()} MODEL RESULTS")
            report.append("-" * 30)
            report.append(f"Overall Accuracy: {metrics['accuracy']:.4f}")
            report.append(f"Binary Accuracy: {metrics['binary_accuracy']:.4f}")
            report.append(f"Macro F1-Score: {metrics['macro_f1']:.4f}")
            report.append(f"Weighted F1-Score: {metrics['weighted_f1']:.4f}")
            report.append(f"Average Confidence: {metrics['avg_confidence']:.4f}")
            report.append("")
            
            # Per-class metrics
            report.append("Per-Class Metrics:")
            for i, label in enumerate(metrics['class_labels']):
                if i < len(metrics['precision']):
                    report.append(f"  {label.capitalize()}:")
                    report.append(f"    Precision: {metrics['precision'][i]:.4f}")
                    report.append(f"    Recall: {metrics['recall'][i]:.4f}")
                    report.append(f"    F1-Score: {metrics['f1'][i]:.4f}")
                    report.append(f"    Support: {metrics['support'][i]}")
            report.append("")
        
        # Comparison summary
        if 'comparison' in results:
            comparison = results['comparison']
            report.append("MODEL COMPARISON SUMMARY")
            report.append("-" * 30)
            report.append(f"Best Overall Accuracy: {comparison['best_accuracy']['model'].upper()} ({comparison['best_accuracy']['score']:.4f})")
            report.append(f"Best F1-Score: {comparison['best_f1']['model'].upper()} ({comparison['best_f1']['score']:.4f})")
            report.append(f"Best Binary Accuracy: {comparison['best_binary_accuracy']['model'].upper()} ({comparison['best_binary_accuracy']['score']:.4f})")
            report.append("")
            
            report.append("Model Rankings by Accuracy:")
            for i, rank in enumerate(comparison['model_rankings']['by_accuracy']):
                report.append(f"  {i+1}. {rank['model'].upper()}: {rank['score']:.4f}")
            report.append("")
        
        return "\n".join(report) 