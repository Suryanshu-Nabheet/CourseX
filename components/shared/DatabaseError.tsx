"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export function DatabaseError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle>Database Connection Required</CardTitle>
          </div>
          <CardDescription>
            The application needs a database connection to function properly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Please configure your database connection in the <code className="bg-gray-100 px-1 rounded">.env</code> file.
          </p>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Quick Setup:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 ml-2">
              <li>Sign up at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a> (free)</li>
              <li>Create a new project</li>
              <li>Copy the connection string from Settings → Database</li>
              <li>Update <code className="bg-gray-100 px-1 rounded">DATABASE_URL</code> in your <code className="bg-gray-100 px-1 rounded">.env</code> file</li>
              <li>Run <code className="bg-gray-100 px-1 rounded">npm run db:push</code></li>
            </ol>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            See <code className="bg-gray-100 px-1 rounded">docs/DATABASE_SETUP.md</code> for detailed instructions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

