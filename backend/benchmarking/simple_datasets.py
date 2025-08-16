import pandas as pd
import numpy as np
from typing import List, Dict
import os
from sklearn.model_selection import train_test_split

class SimpleDataset:
    """Simple dataset class for sentiment140.csv only"""
    
    def __init__(self, name: str, data: pd.DataFrame, text_column: str, label_column: str):
        self.name = name
        self.data = data
        self.text_column = text_column
        self.label_column = label_column
    
    def get_texts(self) -> List[str]:
        """Get all text samples"""
        return self.data[self.text_column].tolist()
    
    def get_labels(self) -> List[str]:
        """Get all labels"""
        return self.data[self.label_column].tolist()
    
    def get_sample(self, n: int = 100) -> 'SimpleDataset':
        """Get a random sample of the dataset"""
        sample_data = self.data.sample(n=min(n, len(self.data)), random_state=42)
        return SimpleDataset(self.name, sample_data, self.text_column, self.label_column)
    
    def split(self, test_size: float = 0.2, random_state: int = 42):
        """Split dataset into train and test sets"""
        train_data, test_data = train_test_split(
            self.data, test_size=test_size, random_state=random_state, stratify=self.data[self.label_column]
        )
        train_dataset = SimpleDataset(f"{self.name}_train", train_data, self.text_column, self.label_column)
        test_dataset = SimpleDataset(f"{self.name}_test", test_data, self.text_column, self.label_column)
        return train_dataset, test_dataset

class Sentiment140Loader:
    """Loader specifically for sentiment140.csv file"""
    
    @staticmethod
    def load_sentiment140(filepath: str = "sentiment140.csv", max_samples: int = None) -> SimpleDataset:
        """
        Load sentiment140.csv file
        
        Args:
            filepath: Path to sentiment140.csv file
            max_samples: Maximum number of samples to load (None for all)
        
        Returns:
            SimpleDataset object
        """
        print(f"Loading Sentiment140 dataset from: {filepath}")
        
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File not found: {filepath}")
        
        # Read the CSV file
        df = pd.read_csv(filepath, header=None, encoding='latin-1')
        
        print(f"Raw file shape: {df.shape}")
        print(f"Columns: {len(df.columns)}")
        
        # Validate Sentiment140 format
        if len(df.columns) < 6:
            raise ValueError(f"Expected at least 6 columns, got {len(df.columns)}")
        
        # Extract polarity (column 0) and text (column 5)
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
        
        # Sample if requested
        if max_samples and len(df_clean) > max_samples:
            df_clean = df_clean.sample(max_samples, random_state=42)
        
        # Final dataset
        final_df = df_clean[['text', 'label']].reset_index(drop=True)
        
        print(f"Loaded {len(final_df)} samples")
        print(f"Label distribution:")
        label_counts = final_df['label'].value_counts()
        for label, count in label_counts.items():
            percentage = (count / len(final_df)) * 100
            print(f"  {label}: {count} ({percentage:.1f}%)")
        
        return SimpleDataset("Sentiment140", final_df, 'text', 'label')
    
    @staticmethod
    def get_dataset_info() -> Dict[str, str]:
        """Get information about the dataset"""
        return {
            "sentiment140": "Twitter Sentiment Analysis (positive/negative tweets from Sentiment140 dataset)"
        } 