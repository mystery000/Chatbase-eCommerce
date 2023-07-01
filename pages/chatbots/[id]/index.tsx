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
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_PROMPT_TEMPLATE } from '@/config/chabot';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/components/layouts/AppLayout';

const Chatbot = () => {
  const router = useRouter();
  const { chatbot, isLoading, mutate: mutateChatbot } = useChatbot();
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openShareDialog, setOpenShareDialog] = useState<boolean>(false);
  const [requireLogin, setRequireLogin] = useState<boolean>(false);
  const [sharing, setSharing] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);

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
      setOpenDeleteDialog(false);
    }
    router.push('/chatbots');
  };

  const handleShareChatbot = async () => {
    setSharing(true);
    // Process to make public

    setShared(true);
    toast.success('Chatbot visibility updated successfully.');
    // Process to remove public
    setTimeout(() => {
      setShared(false);
    }, 10000);

    setSharing(false);
  };

  return (
    <>
      <AppLayout>
        <div className="mx-auto w-3/4">
          <div className="m-4 text-center text-3xl font-bold">
            {chatbot?.name}
          </div>
          <div>
            <Tabs defaultValue="chatbot">
              <TabsList className="w-full gap-4">
                <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="manage-sources">Manage Sources</TabsTrigger>
                <TabsTrigger value="embeded-on-website" asChild>
                  <Dialog>
                    <DialogTrigger>Embeded on website</DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Embeded on website</DialogTitle>
                        <DialogDescription>
                          To add the chatbot any where on your website, add this
                          iframe to your html code
                        </DialogDescription>
                      </DialogHeader>
                      <pre className="w-full overflow-auto whitespace-normal rounded bg-slate-100 p-2 text-xs">
                        <code>
                          {`
                            <iframe
                              src="http://localhost:3000/chatbot-iframe/${chatbot?.chatbot_id}"
                              width="100%"
                              style="height: 100%; min-height: 700px"
                              frameborder="0"
                            ></iframe>
                        `}
                        </code>
                      </pre>
                    </DialogContent>
                  </Dialog>
                </TabsTrigger>
                <TabsTrigger value="share-chatbot" asChild>
                  <Dialog
                    open={openShareDialog}
                    onOpenChange={setOpenShareDialog}
                  >
                    <DialogTrigger>Share chatbot</DialogTrigger>
                    {!shared && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share chatbot</DialogTitle>
                          <DialogDescription>
                            <div className="pb-4 text-lg font-medium leading-6 text-gray-600">
                              By continuing your chatbot will become public
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="require-login"
                            onCheckedChange={(value) => setRequireLogin(value)}
                          />
                          <Label
                            htmlFor="require-login"
                            className="ml-3 text-sm"
                          >
                            <span className="font-medium text-gray-900">
                              Require login for someone to use your chatbot{' '}
                            </span>
                            <span className="text-gray-500">
                              (If you don't require login, the message credits
                              they use will count for your account)
                            </span>
                          </Label>
                        </div>
                        <DialogFooter className="mt-4">
                          <Button onClick={() => setOpenShareDialog(false)}>
                            Cancel
                          </Button>
                          <Button
                            variant={'destructive'}
                            onClick={handleShareChatbot}
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-violet-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            {sharing ? 'Processing...' : 'Make Public'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    )}
                    {shared && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share your chatbot</DialogTitle>
                          <DialogDescription>
                            <div className="pb-4 text-lg font-medium leading-6 text-gray-600">
                              Use this link to access the chatbot
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        <pre className="overflow-auto whitespace-normal rounded bg-slate-100 p-2 text-xs">
                          <code>
                            {`http://localhost:3000/chatbot-iframe/${chatbot?.chatbot_id}`}
                          </code>
                        </pre>
                      </DialogContent>
                    )}
                  </Dialog>
                </TabsTrigger>
                <TabsTrigger value="delete-chatbot" asChild>
                  <Dialog
                    open={openDeleteDialog}
                    onOpenChange={setOpenDeleteDialog}
                  >
                    <DialogTrigger>Delete Chatbot</DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Chatbot</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete your chatbot? This
                          action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button onClick={() => setOpenDeleteDialog(false)}>
                          Cancel
                        </Button>
                        <Button variant={'destructive'} onClick={handleDelete}>
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chatbot">
                <ChatbotPanel chatbotId={chatbot.chatbot_id} />
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
                        className="h-fit whitespace-pre"
                        value={DEFAULT_PROMPT_TEMPLATE.template}
                        onChange={(
                          event: ChangeEvent<HTMLTextAreaElement>,
                        ) => {}}
                      ></Textarea>
                    </div>
                  </CardContent>
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
            </Tabs>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default Chatbot;
