'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DataManagementPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleShowInstructions = () => {
    setMessage('To update data: Run "npm run crawl-data" in your local environment, then commit and push changes to GitHub to trigger Vercel deployment.');
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Data Management</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Update Instructions</CardTitle>
            <CardDescription>
              How to update legal regulations and cases data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleShowInstructions} 
                className="w-full sm:w-auto"
              >
                Show Update Instructions
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto"
              >
                Refresh Page
              </Button>
            </div>
            
            {message && (
              <Alert className="mt-4 bg-blue-50 border-blue-200">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert className="mt-4 bg-red-50 border-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Important Note:</h3>
              <p className="text-sm text-yellow-700">
                Due to Vercel's architecture, data files cannot be modified at runtime. 
                Data updates must be performed in the build process.
              </p>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">How Data Updates Work:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                <li><strong>Automatic:</strong> GitHub Actions runs daily to fetch fresh data and deploy updates</li>
                <li><strong>Manual:</strong> Run "npm run crawl-data" locally, commit and push to trigger deployment</li>
                <li><strong>AI Processing:</strong> All data is processed by AI to extract key information and standardize formats</li>
                <li><strong>Static Deployment:</strong> Updated data becomes part of the deployed application</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Regulations Data</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Fetched from government sources including US Regulations.gov and other legal databases.
                  Includes federal rules, proposed regulations, and compliance requirements.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Court Cases Data</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Retrieved from court databases including Supreme Court decisions and 
                  significant federal and state court rulings.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Data Processing</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  All data is processed by AI to extract key information, standardize formats, 
                  and categorize by relevance to compliance professionals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}