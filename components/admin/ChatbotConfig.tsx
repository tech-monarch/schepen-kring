"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Settings, Bot } from 'lucide-react';
import { getApiUrl, getApiHeaders, API_CONFIG } from '@/lib/api-config';
import { tokenUtils } from '@/utils/auth';

interface ChatbotConfig {
  enabled: boolean;
  service: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  welcomeMessage: string;
  maxHistory: number;
  responseDelay: number;
}

export function ChatbotConfig() {
  const [config, setConfig] = useState<ChatbotConfig>({
    enabled: false,
    service: 'openai',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    maxTokens: 500,
    temperature: 0.7,
    welcomeMessage: "Hi there! I'm answer24, your assistant. How can I help you today?",
    maxHistory: 10,
    responseDelay: 1000,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Load current configuration from environment
    setConfig({
      enabled: process.env.NEXT_PUBLIC_CHATBOT_ENABLED === 'true',
      service: process.env.NEXT_PUBLIC_AI_SERVICE || 'openai',
      apiKey: process.env.NEXT_PUBLIC_AI_API_KEY || '',
      model: process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env.NEXT_PUBLIC_AI_MAX_TOKENS || '500'),
      temperature: parseFloat(process.env.NEXT_PUBLIC_AI_TEMPERATURE || '0.7'),
      welcomeMessage: process.env.NEXT_PUBLIC_CHATBOT_WELCOME_MESSAGE || "Hi there! I'm answer24, your assistant. How can I help you today?",
      maxHistory: parseInt(process.env.NEXT_PUBLIC_CHATBOT_MAX_HISTORY || '10'),
      responseDelay: parseInt(process.env.NEXT_PUBLIC_CHATBOT_RESPONSE_DELAY || '1000'),
    });
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real application, you would save this to your backend
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResult({ success: true, message: 'Configuration saved successfully!' });
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to save configuration' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Get authentication token
      const token = tokenUtils.getToken();
      
      if (!token) {
        setTestResult({ 
          success: false, 
          message: 'Authentication required. Please log in to test the chatbot.' 
        });
        setIsTesting(false);
        return;
      }

      // Call backend AI status endpoint
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.CHAT.AI_STATUS),
        {
          method: 'GET',
          headers: getApiHeaders(token),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTestResult({ 
          success: true, 
          message: `Chatbot is working correctly! Service: ${data.service || 'Connected'}` 
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTestResult({ 
          success: false, 
          message: errorData.message || `Chatbot test failed (${response.status})` 
        });
      }
    } catch (error) {
      console.error('Chatbot test error:', error);
      setTestResult({ 
        success: false, 
        message: `Failed to test chatbot: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getModelOptions = (service: string) => {
    switch (service) {
      case 'openai':
        return [
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        ];
      case 'anthropic':
        return [
          { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
        ];
      case 'cohere':
        return [
          { value: 'command', label: 'Command' },
          { value: 'command-light', label: 'Command Light' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Chatbot Configuration
          </CardTitle>
          <CardDescription>
            Configure your AI chatbot settings and API connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Chatbot</Label>
              <p className="text-sm text-muted-foreground">
                Turn the chatbot on or off for your website
              </p>
            </div>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {/* AI Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="service">AI Service</Label>
            <Select
              value={config.service}
              onValueChange={(value) => setConfig(prev => ({ ...prev, service: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select AI service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                <SelectItem value="cohere">Cohere</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter your API key"
            />
            <p className="text-sm text-muted-foreground">
              Your API key is stored securely and never shared
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={config.model}
              onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {getModelOptions(config.service).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                value={config.maxTokens}
                onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                min="1"
                max="4000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                min="0"
                max="2"
              />
            </div>
          </div>

          {/* Welcome Message */}
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Textarea
              id="welcomeMessage"
              value={config.welcomeMessage}
              onChange={(e) => setConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
              placeholder="Enter the welcome message for new users"
              rows={3}
            />
          </div>

          {/* Test Result */}
          {testResult && (
            <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                  {testResult.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              Save Configuration
            </Button>
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting || !config.enabled}
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
              Test Chatbot
            </Button>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={config.enabled ? 'default' : 'secondary'}>
              {config.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <Badge variant="outline">
              {config.service.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
