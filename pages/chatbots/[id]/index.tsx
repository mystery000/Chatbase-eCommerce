import NavbarLayout from '@/components/NavbarLayout';
import ChatbotPanel from '@/components/chatbots/ChatbotPanel';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useChatbot from '@/lib/hooks/use-chatbot';

const Chatbot = () => {
  const { chatbot, loading } = useChatbot();

  if (loading || !chatbot) {
    return (
      <>
        <p className="text-red/50 text-center">Loading...</p>
      </>
    );
  }

  return (
    <>
      <NavbarLayout>
        <div className="mx-auto w-3/4">
          <div className="m-4 text-center text-3xl font-bold">
            {chatbot?.name || 'Default Chatbot Name'}
          </div>
          <div>
            <Tabs defaultValue="chatbot">
              <TabsList className="w-full gap-4">
                <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="manage-sources">Manage Sources</TabsTrigger>
                <TabsTrigger value="embeded-on-website">
                  Embeded on website
                </TabsTrigger>
                <TabsTrigger value="share-chatbot">Share Chatbot</TabsTrigger>
                <TabsTrigger value="delete-chatbot">Delete Chatbot</TabsTrigger>
              </TabsList>
              <TabsContent value="chatbot">
                <ChatbotPanel />
              </TabsContent>
              <TabsContent value="settings">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Settings Description</CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
              <TabsContent value="dashboard">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle>Dashboard</CardTitle>
                    <CardDescription>Dashboard Description</CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
              <TabsContent value="manage-sources">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle>Manage Sources</CardTitle>
                    <CardDescription>Mange Sources Content</CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
              <TabsContent value="embeded-on-website">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle>Embeded on website</CardTitle>
                    <CardDescription>Embed on website content</CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
              <TabsContent value="share-chatbot">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle>Share Chatbot</CardTitle>
                    <CardDescription>Share Chatbot Content</CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
              <TabsContent value="delete-chatbot">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle>Delete Chatbot</CardTitle>
                    <CardDescription>Delete Chatbot Content</CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </NavbarLayout>
    </>
  );
};

export default Chatbot;
