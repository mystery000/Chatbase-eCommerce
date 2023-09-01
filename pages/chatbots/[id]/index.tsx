import { useState, useCallback, ChangeEvent, useEffect } from 'react';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

const PacmanLoader = dynamic(() => import('@/components/loaders/PacmanLoader'));
const AppLayout = dynamic(() => import('@/components/layouts/AppLayout'), {
  loading: () => <PacmanLoader />,
});
const ChatbotPanel = dynamic(
  () => import('@/components/chatbots/ChatbotPanel'),
  {
    loading: () => <PacmanLoader />,
  },
);
const RetrainChatbot = dynamic(
  () => import('@/components/chatbots/RetrainChatbot'),
  {
    loading: () => <PacmanLoader />,
  },
);

import { Card, CardFooter, CardContent } from '@/components/ui/card';

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

import { APP_URL } from '@/config/app';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import useChatbot from '@/lib/hooks/use-chatbot';
import useSources from '@/lib/hooks/use-sources';
import useChatbots from '@/lib/hooks/use-chatbots';
import { Chatbot, Contact } from '@/types/database';
import { deleteChatbot, updateChatbotSettings } from '@/lib/api';

const Chatbot = () => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openShareDialog, setOpenShareDialog] = useState<boolean>(false);
  const [requireLogin, setRequireLogin] = useState<boolean>(false);
  const [sharing, setSharing] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [profileIcon, setProfileIcon] = useState<string>('');
  const [chatbotIcon, setChatbotIcon] = useState<string>('');
  const [avatars, setAvatars] = useState<{ profile?: File; chatbot?: File }>();
  const [stateChatbot, setStateChatbot] = useState<Chatbot | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const router = useRouter();

  const {
    chatbot,
    isLoading: isLoadingChatbot,
    mutate: mutateChatbot,
  } = useChatbot();

  const { mutate: mutateChatbots } = useChatbots();

  const {
    sources,
    isLoading: isLoadingSources,
    mutate: mutateSources,
  } = useSources();

  useEffect(() => {
    if (!chatbot) return;
    setStateChatbot({
      ...chatbot,
      contact: JSON.parse(`${chatbot?.contact}`) as Contact,
    });
  }, [chatbot]);

  const handleResetSettings = useCallback(() => {
    if (!chatbot) return;
    setStateChatbot({
      ...chatbot,
      contact: JSON.parse(`${chatbot?.contact}`) as Contact,
    });
    setAvatars(undefined);
    setProfileIcon('');
    setChatbotIcon('');
  }, [chatbot]);

  if (isLoadingChatbot || isLoadingSources) {
    return <PacmanLoader />;
  }

  if (!chatbot || !sources) {
    return <PacmanLoader />;
  }

  if (!stateChatbot) {
    return <PacmanLoader />;
  }

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteChatbot(chatbot.chatbot_id);
      await mutateChatbots();
      await mutateChatbot();
      setDeleting(false);
      toast.success('Deleted successfully.');
    } catch (error) {
      setDeleting(false);
      console.log('error:', error);
      toast.error('Failed to delete a chatbot');
    } finally {
      setOpenDeleteDialog(false);
    }
    setTimeout(() => {
      router.push('/chatbots');
    }, 500);
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
    if (e.target.files) {
      setProfileIcon(URL.createObjectURL(e.target.files[0]));
      setAvatars({ ...avatars, profile: e.target.files[0] });
    }
  };

  const handleChatbotIcon = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setChatbotIcon(URL.createObjectURL(e.target.files[0]));
      setAvatars({ ...avatars, chatbot: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    if (!stateChatbot) return;
    setSaving(true);
    try {
      await updateChatbotSettings(stateChatbot, avatars);
      mutateChatbot();
      mutateChatbots();
      toast.success('Saved');
      setSaving(false);
    } catch (error) {
      setSaving(false);
      console.log(error);
    }
  };

  const characters = sources.reduce((sum, source) => {
    return sum + source.characters;
  }, 0);

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
                <TabsTrigger value="settings" onClick={handleResetSettings}>
                  Settings
                </TabsTrigger>
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
                              src="${APP_URL}/chatbot-iframe/${chatbot?.chatbot_id}"
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
                              {`(If you don't require login, the message credits
                              they use will count for your account)`}
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
                            {`${APP_URL}/chatbot-iframe/${chatbot?.chatbot_id}`}
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
                        <Button
                          variant={'destructive'}
                          onClick={handleDelete}
                          disabled={deleting}
                        >
                          {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chatbot">
                <ChatbotPanel
                  chatbot={chatbot}
                  playing={true}
                  profileIcon={`${router.basePath}/${stateChatbot.profile_icon}`}
                  initialMessages={chatbot.initial_messages}
                />
              </TabsContent>
              <TabsContent value="settings">
                <Card>
                  <CardContent>
                    <div className="pt-8">
                      <Label htmlFor="chatbotId">Chatbot ID</Label>
                      <p id="chatbotId" className="font-bold">
                        {stateChatbot.chatbot_id}
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
                        value={stateChatbot.name}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setStateChatbot({
                            ...stateChatbot,
                            name: event.target.value,
                          });
                        }}
                      ></Input>
                    </div>
                    <div className="pt-8">
                      <Label htmlFor="basePrompt">Base Prompt</Label>
                      <Textarea
                        id="basePrompt"
                        className="h-48"
                        value={`${stateChatbot.promptTemplate}`}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                          setStateChatbot({
                            ...stateChatbot,
                            promptTemplate: event.target.value,
                          });
                        }}
                      ></Textarea>
                    </div>
                    <div className="pt-8">
                      <Label htmlFor="model">Model</Label>
                      <Select
                        defaultValue={stateChatbot.model}
                        value={stateChatbot.model}
                        onValueChange={(value) => {
                          setStateChatbot({ ...stateChatbot, model: value });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select the LLM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-3.5-turbo">
                            gpt-3.5-turbo
                          </SelectItem>
                          <SelectItem value="gpt-4">gpt-4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pt-8">
                      <label className="block text-sm font-medium text-gray-700">
                        Temperature
                      </label>
                      <p className="text-sm">{stateChatbot.temperature}</p>
                      <Slider
                        max={1}
                        step={0.1}
                        className="py-2"
                        value={[stateChatbot.temperature]}
                        onValueChange={(value: number[]) => {
                          setStateChatbot({
                            ...stateChatbot,
                            temperature: value[0],
                          });
                        }}
                      />
                      <div className="flex justify-between">
                        <p className="text-xs text-zinc-700">Reserved</p>
                        <p className="text-xs text-zinc-700">Creative</p>
                      </div>
                    </div>
                    <div className="pt-8">
                      <Label htmlFor="visibilty">Visibilty</Label>
                      <Select
                        defaultValue={stateChatbot.visibility}
                        value={stateChatbot.visibility}
                        onValueChange={(value) =>
                          setStateChatbot({
                            ...stateChatbot,
                            visibility: value,
                          })
                        }
                      >
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
                        {` 'Private': No one can access your chatbot except you
                        (your account)`}
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        {`'Private but can be embedded on website': Other people
                        can't access your chatbot if you send them the link, but
                        you can still embed it on your website and your website
                        visitors will be able to use it. (make sure to set your
                        domains)`}
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        {`'Public': Anyone with the link can access it on
                        chatbase.co and can be embedded on your website.`}
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        Set to public if you want to be able to send a link of
                        your chatbot to someone to try it.
                      </p>
                    </div>
                    <div className="pt-8">
                      <div className="flex justify-between">
                        <Label htmlFor="rate_limit">Rate Limiting</Label>
                        <Button
                          variant={'secondary'}
                          size={'sm'}
                          onClick={(event) => {
                            setStateChatbot({
                              ...stateChatbot,
                              ip_limit: chatbot.ip_limit,
                              ip_limit_message: chatbot.ip_limit_message,
                              ip_limit_timeframe: chatbot.ip_limit_timeframe,
                            });
                          }}
                        >
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
                          type={'number'}
                          min={1}
                          value={stateChatbot.ip_limit}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setStateChatbot({
                              ...stateChatbot,
                              ip_limit: Number(event.target.value),
                            });
                          }}
                        />
                        messages every
                        <Input
                          type={'number'}
                          min={1}
                          value={stateChatbot.ip_limit_timeframe}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setStateChatbot({
                              ...stateChatbot,
                              ip_limit_timeframe: Number(event.target.value),
                            });
                          }}
                        />
                        seconds.
                      </div>
                      <div className="my-4 text-sm text-zinc-700">
                        Show this message to show when limit is hit
                        <Input
                          value={stateChatbot.ip_limit_message}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setStateChatbot({
                              ...stateChatbot,
                              ip_limit_message: event.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-1/2 pt-8">
                      <Label>Collect Customer Info</Label>
                      <div className="my-1 flex justify-between">
                        <label className="block pb-2 text-sm font-semibold">
                          Title
                        </label>
                        <Button
                          variant={'secondary'}
                          size={'sm'}
                          onClick={() =>
                            setStateChatbot({
                              ...stateChatbot,
                              contact: {
                                ...stateChatbot.contact,
                                title: (
                                  JSON.parse(`${chatbot.contact}`) as Contact
                                ).title,
                              },
                            })
                          }
                        >
                          Reset
                        </Button>
                      </div>
                      <Input
                        className="mb-4"
                        value={stateChatbot.contact.title}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setStateChatbot({
                            ...stateChatbot,
                            contact: {
                              ...stateChatbot.contact,
                              title: event.target.value,
                            },
                          })
                        }
                      />

                      <label className="block pb-2 text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <Switch
                        checked={stateChatbot.contact.name.active}
                        onCheckedChange={(value) =>
                          setStateChatbot({
                            ...stateChatbot,
                            contact: {
                              ...stateChatbot.contact,
                              name: {
                                ...stateChatbot.contact.name,
                                active: value,
                              },
                            },
                          })
                        }
                      />
                      {stateChatbot.contact.name.active && (
                        <>
                          <div className="my-1 flex justify-end">
                            <Button
                              variant={'secondary'}
                              size={'sm'}
                              onClick={() =>
                                setStateChatbot({
                                  ...stateChatbot,
                                  contact: {
                                    ...stateChatbot.contact,
                                    name: {
                                      ...stateChatbot.contact.name,
                                      label: (
                                        JSON.parse(
                                          `${chatbot.contact}`,
                                        ) as Contact
                                      ).name.label,
                                    },
                                  },
                                })
                              }
                            >
                              Reset
                            </Button>
                          </div>
                          <Input
                            className="mb-4"
                            value={stateChatbot.contact.name.label}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              setStateChatbot({
                                ...stateChatbot,
                                contact: {
                                  ...stateChatbot.contact,
                                  name: {
                                    ...stateChatbot.contact.name,
                                    label: event.target.value,
                                  },
                                },
                              })
                            }
                          />
                        </>
                      )}

                      <label className="block pb-2 text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <Switch
                        checked={stateChatbot.contact.email.active}
                        onCheckedChange={(value) =>
                          setStateChatbot({
                            ...stateChatbot,
                            contact: {
                              ...stateChatbot.contact,
                              email: {
                                ...stateChatbot.contact.email,
                                active: value,
                              },
                            },
                          })
                        }
                      />
                      {stateChatbot.contact.email.active && (
                        <>
                          <div className="my-1 flex justify-end">
                            <Button
                              variant={'secondary'}
                              size={'sm'}
                              onClick={() =>
                                setStateChatbot({
                                  ...stateChatbot,
                                  contact: {
                                    ...stateChatbot.contact,
                                    email: {
                                      ...stateChatbot.contact.email,
                                      label: (
                                        JSON.parse(
                                          `${chatbot.contact}`,
                                        ) as Contact
                                      ).email.label,
                                    },
                                  },
                                })
                              }
                            >
                              Reset
                            </Button>
                          </div>
                          <Input
                            className="mb-4"
                            value={stateChatbot.contact.email.label}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              setStateChatbot({
                                ...stateChatbot,
                                contact: {
                                  ...stateChatbot.contact,
                                  email: {
                                    ...stateChatbot.contact.email,
                                    label: event.target.value,
                                  },
                                },
                              })
                            }
                          />
                        </>
                      )}
                      <label className="block pb-2 text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <Switch
                        checked={stateChatbot.contact.phone.active}
                        onCheckedChange={(value) =>
                          setStateChatbot({
                            ...stateChatbot,
                            contact: {
                              ...stateChatbot.contact,
                              phone: {
                                ...stateChatbot.contact.phone,
                                active: value,
                              },
                            },
                          })
                        }
                      />
                      {stateChatbot.contact.phone.active && (
                        <>
                          <div className="my-1 flex justify-end">
                            <Button
                              variant={'secondary'}
                              size={'sm'}
                              onClick={() =>
                                setStateChatbot({
                                  ...stateChatbot,
                                  contact: {
                                    ...stateChatbot.contact,
                                    phone: {
                                      ...stateChatbot.contact.phone,
                                      label: (
                                        JSON.parse(
                                          `${chatbot.contact}`,
                                        ) as Contact
                                      ).phone.label,
                                    },
                                  },
                                })
                              }
                            >
                              Reset
                            </Button>
                          </div>
                          <Input
                            className="mb-4"
                            value={stateChatbot.contact.phone.label}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              setStateChatbot({
                                ...stateChatbot,
                                contact: {
                                  ...stateChatbot.contact,
                                  phone: {
                                    ...stateChatbot.contact.phone,
                                    label: event.target.value,
                                  },
                                },
                              })
                            }
                          />
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
                              <Button
                                variant={'secondary'}
                                size={'sm'}
                                onClick={() =>
                                  setStateChatbot({
                                    ...stateChatbot,
                                    initial_messages: chatbot.initial_messages,
                                  })
                                }
                              >
                                Reset
                              </Button>
                            </div>
                            <div className="mt-1">
                              <Textarea
                                value={stateChatbot.initial_messages?.replace(
                                  /\\n/g,
                                  '\n',
                                )}
                                onChange={(
                                  event: ChangeEvent<HTMLTextAreaElement>,
                                ) => {
                                  setStateChatbot({
                                    ...stateChatbot,
                                    initial_messages: event.target.value,
                                  });
                                }}
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
                              accept=".png, .jpeg, .jpg"
                              onChange={handleProfileIcon}
                            />
                          </div>
                          <div className="pb-8">
                            <label className="block text-sm font-medium text-gray-700">
                              Remove profile icon
                            </label>
                            <Checkbox
                              checked={!stateChatbot.active_profile_icon}
                              onCheckedChange={(value) =>
                                setStateChatbot({
                                  ...stateChatbot,
                                  active_profile_icon: !value,
                                })
                              }
                            />
                          </div>
                          <div className="pb-8">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                              Update chatbot icon
                            </label>
                            <Input
                              type="file"
                              accept=".png, .jpeg, .jpg"
                              onChange={handleChatbotIcon}
                            />
                            <div className="mx-auto w-fit">
                              <label className="my-2 block text-center text-sm font-medium text-gray-700">
                                Preview
                              </label>
                              <Card>
                                <CardContent className="p-0">
                                  <Image
                                    src={
                                      chatbotIcon ||
                                      `/${stateChatbot.chatbot_icon}`
                                    }
                                    className="mx-auto h-40 w-40 rounded-t-sm border-none object-cover"
                                    loading="lazy"
                                    width={160}
                                    height={160}
                                    alt="Icon of the chatbot"
                                  />
                                </CardContent>
                                <CardFooter className="select-none p-2">
                                  <p className="w-8 grow truncate text-center">
                                    {stateChatbot.name}
                                  </p>
                                </CardFooter>
                              </Card>
                            </div>
                          </div>
                        </div>
                        <div className="w-1/2 flex-1">
                          <ChatbotPanel
                            chatbot={{
                              ...stateChatbot,
                              contact: JSON.stringify(
                                stateChatbot.contact,
                              ) as unknown as Contact,
                            }}
                            profileIcon={
                              profileIcon ||
                              `${router.basePath}/${stateChatbot.profile_icon}`
                            }
                            initialMessages={stateChatbot.initial_messages}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
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
