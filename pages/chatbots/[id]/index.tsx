import NavbarLayout from '@/components/NavbarLayout';
import ChatbotPanel from '@/components/chatbots/ChatbotPanel';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { deleteChatbot } from '@/lib/api';
import useChatbot from '@/lib/hooks/use-chatbot';
import { Router, useRouter } from 'next/router';
import { useState, useCallback, ChangeEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useConfigContext } from '@/lib/context/config';
import { Textarea } from '@/components/ui/textarea';

const Chatbot = () => {
  const router = useRouter();
  const { chatbot, isLoading, mutate: mutateChatbot } = useChatbot();
  const [open, setOpen] = useState<boolean>(false);

  if (isLoading || !chatbot) {
    return (
      <>
        <p className="text-red/50 text-center">Loading...</p>
      </>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteChatbot(chatbot.chatbot_id);
      await mutateChatbot();
      toast.success('Deleted successfully.');
    } catch (error) {
      console.log('error:', error);
      toast.error('Failed to delete a chatbot');
    } finally {
      setOpen(false);
    }
    router.push('/chatbots');
  };

  const { modelConfig } = useConfigContext();

  return (
    <>
      <NavbarLayout>
        <div className="mx-auto w-3/4">
          <div className="m-4 text-center text-3xl font-bold">
            {chatbot?.name}
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
                <TabsTrigger value="delete-chatbot" asChild>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger>Delete Chatbot</DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Chatbot</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete your chatbot? This
                          action cannot be undone.
                        </DialogDescription>
                        <DialogFooter>
                          <Button onClick={() => setOpen(false)}>Cancel</Button>
                          <Button
                            variant={'destructive'}
                            onClick={handleDelete}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chatbot">
                <ChatbotPanel />
              </TabsContent>
              <TabsContent value="settings">
                <Card>
                  <CardContent>
                    <div className="pt-8">
                      <Label htmlFor="chatbotId">Chatbot ID</Label>
                      <p id="chatbotId" className="font-bold">
                        {chatbot?.chatbot_id}
                      </p>
                    </div>
                    <div className="pt-8">
                      <Label htmlFor="characters">Number of characters</Label>
                      <p id="characters" className="font-bold">
                        29489
                      </p>
                    </div>
                    <div className="pt-8">
                      <Label htmlFor="chatbotName">Chatbot Name</Label>
                      <Input
                        id="chatbotName"
                        value={chatbot?.name}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {}}
                      ></Input>
                    </div>
                    <div className="pt-8">
                      <Label htmlFor="basePrompt">Base Prompt</Label>
                      <Textarea
                        id="basePrompt"
                        className="whitespace-pre"
                        value={modelConfig?.promptTemplate}
                        onChange={(
                          event: ChangeEvent<HTMLTextAreaElement>,
                        ) => {}}
                      ></Textarea>
                    </div>
                  </CardContent>
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
            </Tabs>
          </div>
        </div>
      </NavbarLayout>
    </>
  );
};

export default Chatbot;
