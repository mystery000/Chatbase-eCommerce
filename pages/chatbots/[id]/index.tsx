import { useState, ChangeEvent } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

const ChatbotPanel = dynamic(
  () => import('@/components/chatbots/ChatbotPanel'),
);
const AppLayout = dynamic(() => import('@/components/layouts/AppLayout'));
const RetrainChatbot = dynamic(
  () => import('@/components/chatbots/RetrainChatbot'),
);

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { deleteChatbot } from '@/lib/api';
import useChatbot from '@/lib/hooks/use-chatbot';
import useSources from '@/lib/hooks/use-sources';
import { Contact } from '@/types/database';

const Chatbot = () => {
  const router = useRouter();
  const {
    chatbot,
    isLoading: isLoadingChatbot,
    mutate: mutateChatbot,
  } = useChatbot();

  const {
    sources,
    isLoading: isLoadingSources,
    mutate: mutateSources,
  } = useSources();

  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openShareDialog, setOpenShareDialog] = useState<boolean>(false);
  const [requireLogin, setRequireLogin] = useState<boolean>(false);
  const [sharing, setSharing] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [profileIcon, setProfileIcon] = useState<string>('');
  const [chatbotIcon, setChatbotIcon] = useState<string>('');
  if (isLoadingChatbot || isLoadingSources) {
    return (
      <>
        <p className="text-red/50 text-center">Loading...</p>
      </>
    );
  }

  if (!chatbot || !sources) {
    return (
      <>
        <div className="text-gree/50 text-center">No Content</div>
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

  const handleProfileIcon = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setProfileIcon(URL.createObjectURL(e.target.files[0]));
  };

  const handleChatbotIcon = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setChatbotIcon(URL.createObjectURL(e.target.files[0]));
  };
  const characters = sources.reduce((sum, source) => {
    return sum + source.characters;
  }, 0);

  const contact: Contact = JSON.parse(`${chatbot?.contact}`);

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
                <ChatbotPanel
                  chatbotId={chatbot.chatbot_id}
                  playing={true}
                  profileIcon={chatbot.profile_icon}
                />
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
                        {characters}
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
                        className="h-48"
                        value={`${chatbot.promptTemplate}`}
                        onChange={(
                          event: ChangeEvent<HTMLTextAreaElement>,
                        ) => {}}
                      ></Textarea>
                    </div>
                    <div className="pt-8">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={chatbot?.model}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {}}
                      ></Input>
                    </div>
                    <div className="pt-8">
                      <label className="block text-sm font-medium text-gray-700">
                        Temperature
                      </label>
                      <p className="text-sm">{chatbot.temperature}</p>
                      <Slider
                        max={1}
                        step={0.1}
                        className="py-2"
                        value={[chatbot.temperature]}
                      />
                      <div className="flex justify-between">
                        <p className="text-xs text-zinc-700">Reserved</p>
                        <p className="text-xs text-zinc-700">Creative</p>
                      </div>
                    </div>
                    <div className="pt-8">
                      <Label htmlFor="visibilty">Visibilty</Label>
                      <Select defaultValue={chatbot.visibility}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select the visibilty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="protected">
                            Private but can be embeded on website
                          </SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="mt-2 text-sm text-zinc-500">
                        'Private': No one can access your chatbot except you
                        (your account)
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        'Private but can be embedded on website': Other people
                        can't access your chatbot if you send them the link, but
                        you can still embed it on your website and your website
                        visitors will be able to use it. (make sure to set your
                        domains)
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        'Public': Anyone with the link can access it on
                        chatbase.co and can be embedded on your website.
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        Set to public if you want to be able to send a link of
                        your chatbot to someone to try it.
                      </p>
                    </div>
                    <div className="pt-8">
                      <div className="flex justify-between">
                        <Label htmlFor="rate_limit">Rate Limiting</Label>
                        <Button variant={'secondary'} size={'sm'}>
                          Reset
                        </Button>
                      </div>
                      <p className="mt-2 text-sm text-zinc-500">
                        Limit the number of messages sent from one device on the
                        iframe and chat bubble (this limit will not be applied
                        to you on chatbase.co, only on your website for your
                        users to prevent abuse).
                      </p>
                      <div className="mt-1 text-sm text-zinc-700">
                        Limit to only
                        <Input
                          value={chatbot?.ip_limit}
                          onChange={(
                            event: ChangeEvent<HTMLInputElement>,
                          ) => {}}
                        />
                        messages every
                        <Input
                          value={chatbot?.ip_limit_timeframe}
                          onChange={(
                            event: ChangeEvent<HTMLInputElement>,
                          ) => {}}
                        />
                        seconds.
                      </div>
                      <div className="my-4 text-sm text-zinc-700">
                        Show this message to show when limit is hit
                        <Input
                          value={chatbot?.ip_limit_message}
                          onChange={(
                            event: ChangeEvent<HTMLInputElement>,
                          ) => {}}
                        />
                      </div>
                    </div>
                    <div className="w-1/2 pt-8">
                      <Label>Collect Customer Info</Label>
                      <div className="my-1 flex justify-between">
                        <label className="block pb-2 text-sm font-semibold">
                          Title
                        </label>
                        <Button variant={'secondary'} size={'sm'}>
                          Reset
                        </Button>
                      </div>
                      <Input className="mb-4" value={contact.title} />

                      <label className="block pb-2 text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <Switch checked={contact.name.active} />
                      {contact.name.active && (
                        <>
                          <div className="my-1 flex justify-end">
                            <Button variant={'secondary'} size={'sm'}>
                              Reset
                            </Button>
                          </div>
                          <Input className="mb-4" value={contact.name.label} />
                        </>
                      )}

                      <label className="block pb-2 text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <Switch checked={contact.email.active} />
                      {contact.email.active && (
                        <>
                          <div className="my-1 flex justify-end">
                            <Button variant={'secondary'} size={'sm'}>
                              Reset
                            </Button>
                          </div>
                          <Input className="mb-4" value={contact.email.label} />
                        </>
                      )}
                      <label className="block pb-2 text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <Switch checked={contact.phone.active} />
                      {contact.phone.active && (
                        <>
                          <div className="my-1 flex justify-end">
                            <Button variant={'secondary'} size={'sm'}>
                              Reset
                            </Button>
                          </div>
                          <Input className="mb-4" value={contact.phone.label} />
                        </>
                      )}
                    </div>
                    <div className="pt-8">
                      <h4 className="mt-5 text-lg font-semibold">
                        Chat Interface
                      </h4>
                      <h4 className="mb-8 text-sm text-zinc-600">
                        applies when embedded on a website
                      </h4>
                      <div className="flex flex-col justify-between space-x-8 sm:flex-row">
                        <div className="w-1/2 flex-1">
                          <div className="pb-8">
                            <div className="flex justify-between">
                              <label className="block text-sm font-medium text-gray-700">
                                Initial Messages
                              </label>
                              <Button variant={'secondary'} size={'sm'}>
                                Reset
                              </Button>
                            </div>
                            <div className="mt-1">
                              <Textarea
                                value={JSON.parse(
                                  `${chatbot.initial_messages}`,
                                )}
                                onChange={(
                                  event: ChangeEvent<HTMLTextAreaElement>,
                                ) => {}}
                              ></Textarea>
                              <p className="mt-2 text-sm text-zinc-500">
                                Enter each message in a new line.
                              </p>
                            </div>
                          </div>
                          <div className="pb-8">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                              Update profile icon
                            </label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleProfileIcon}
                            />
                          </div>
                          <div className="pb-8">
                            <label className="block text-sm font-medium text-gray-700">
                              Remove profile icon
                            </label>
                            <Checkbox />
                          </div>
                          <div className="pb-8">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                              Update chatbot icon
                            </label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleChatbotIcon}
                            />
                            <div className="mx-auto w-fit">
                              <label className="my-2 block text-center text-sm font-medium text-gray-700">
                                Preview
                              </label>
                              <Card>
                                <CardContent className="p-0">
                                  <img
                                    src={chatbotIcon || chatbot.chatbot_icon}
                                    className="mx-auto h-40 w-40 rounded-t-sm border-none object-cover"
                                    loading="lazy"
                                  />
                                </CardContent>
                                <CardFooter className="select-none p-2">
                                  <p className="w-8 grow truncate text-center">
                                    {chatbot.name}
                                  </p>
                                </CardFooter>
                              </Card>
                            </div>
                          </div>
                        </div>
                        <div className="w-1/2 flex-1">
                          <ChatbotPanel
                            chatbotId={chatbot.chatbot_id}
                            profileIcon={profileIcon || chatbot.profile_icon}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button className="w-full">Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="manage-sources">
                <Card>
                  <RetrainChatbot />
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
