'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const QuestionTypeTable = () => {
  const tableData = [
    {
      questionType: 'Multiple Choice (Single)',
      statisticalAnalyses: ['Frequency counts', 'Chi-Square test', 'Contingency tables'],
      chartsVisualizations: ['Bar chart', 'Pie chart', 'Stacked bar chart'],
      notes: 'Suitable for categorical data; ideal for associations with other variables.',
    },
    {
      questionType: 'Multiple Choice (Multi-Select)',
      statisticalAnalyses: ['Frequency counts', 'Chi-Square test', 'Contingency tables'],
      chartsVisualizations: ['Bar chart (stacked or grouped)', 'Heatmap'],
      notes: 'Handles multiple selections; use grouped charts for multiple categories.',
    },
    {
      questionType: 'Open-Ended (Text)',
      statisticalAnalyses: ['Thematic analysis', 'Word frequency', 'Sentiment analysis (preprocessed)', 'Correlation (with processed scores)'],
      chartsVisualizations: ['Word cloud', 'Bar chart (frequency)', 'Line chart (sentiment trend)'],
      notes: 'Requires NLP preprocessing for numerical analysis; qualitative focus.',
    },
    {
      questionType: 'Rating Scale',
      statisticalAnalyses: ['Mean, median, mode', 'Standard deviation', 't-test', 'ANOVA', 'Pearson/Spearman correlation', 'Factor analysis'],
      chartsVisualizations: ['Histogram', 'Box plot', 'Line chart (trend)', 'Scatter plot'],
      notes: 'Treat as interval if validated; longitudinal data enhances trend analysis.',
    },
    {
      questionType: 'Yes/No',
      statisticalAnalyses: ['Frequency counts', 'Chi-Square test', 'Contingency tables'],
      chartsVisualizations: ['Bar chart', 'Pie chart', 'Stacked bar chart'],
      notes: 'Binary categorical data; useful for simple associations.',
    },
    {
      questionType: 'Dropdown',
      statisticalAnalyses: ['Frequency counts', 'Chi-Square test', 'Contingency tables'],
      chartsVisualizations: ['Bar chart', 'Pie chart', 'Stacked bar chart'],
      notes: 'Similar to Multiple Choice; single selection limits complexity.',
    },
    {
      questionType: 'Matrix/Rating Grid',
      statisticalAnalyses: ['Mean, median, mode', 'Standard deviation', 't-test', 'ANOVA', 'Factor analysis', 'SEM'],
      chartsVisualizations: ['Heatmap', 'Bar chart (per row)', 'Box plot'],
      notes: 'Multi-dimensional ratings; ideal for multi-item constructs and SEM.',
    },
    {
      questionType: 'Date Picker',
      statisticalAnalyses: ['Frequency by date range', 'Time series analysis (with longitudinal data)'],
      chartsVisualizations: ['Line chart (trend)', 'Bar chart (frequency)'],
      notes: 'Supports temporal analysis; pair with other types for richer insights.',
    },
    {
      questionType: 'File Upload',
      statisticalAnalyses: ['Frequency counts (file types)', 'Correlation (with metadata scores)', 'Qualitative coding'],
      chartsVisualizations: ['Bar chart (file type frequency)', 'Scatter plot (metadata)'],
      notes: 'Requires metadata extraction (e.g., size, date); qualitative focus.',
    },
    {
      questionType: 'Ranking',
      statisticalAnalyses: ['Median rank', 'Spearman’s rank correlation', 'Frequency of top ranks'],
      chartsVisualizations: ['Bar chart (rank distribution)', 'Line chart (rank trend)'],
      notes: 'Ordinal data; useful for preference ordering and correlations.',
    },
    {
      questionType: 'Numerical Input',
      statisticalAnalyses: ['Mean, median, mode', 'Standard deviation', 't-test', 'ANOVA', 'Regression', 'Time series'],
      chartsVisualizations: ['Histogram', 'Box plot', 'Line chart (trend)', 'Scatter plot'],
      notes: 'Provides continuous data suitable for a wide range of parametric tests.',
    },
  ];

  return (
    <Card>
        <CardHeader>
            <CardTitle>Survey Analysis Guide</CardTitle>
            <CardDescription>A reference for which statistical analyses and visualizations to use for each question type.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Question Type</TableHead>
                    <TableHead>Statistical Analyses</TableHead>
                    <TableHead>Charts/Visualizations</TableHead>
                    <TableHead>Notes</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {tableData.map((row, index) => (
                    <TableRow key={index}>
                    <TableCell className="font-medium">{row.questionType}</TableCell>
                    <TableCell>
                        <ul className="list-disc list-inside space-y-1">
                        {row.statisticalAnalyses.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                        </ul>
                    </TableCell>
                    <TableCell>
                        <ul className="list-disc list-inside space-y-1">
                        {row.chartsVisualizations.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                        </ul>
                    </TableCell>
                    <TableCell>{row.notes}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
};

export default QuestionTypeTable;
