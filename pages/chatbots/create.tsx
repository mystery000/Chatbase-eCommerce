import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { FC, useCallback, useState, useEffect, ChangeEvent } from 'react';

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card';

import cn from 'classnames';
import validator from 'validator';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { pluralize } from '@/lib/utils';
import { createChatbot } from '@/lib/api';
import { ClipLoader } from 'react-spinners';
import { parseFile } from '@/lib/parse-file';
import { useDropzone } from 'react-dropzone';
import { Trash2, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import useChatbots from '@/lib/hooks/use-chatbots';
import { Textarea } from '@/components/ui/textarea';
const Button = dynamic(() => import('@/components/ui/buttoneEx'));
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { crawlWebsite } from '@/lib/integrations/website';
import { crawlSitemap } from '@/lib/integrations/sitemap';
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import { StateSourceType, StateSourcesType } from '@/types/types';
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.8.162/pdf.worker.min.js`;

const PacmanLoader = dynamic(() => import('@/components/loaders/PacmanLoader'));
const AppLayout = dynamic(() => import('@/components/layouts/AppLayout'), {
  loading: () => <PacmanLoader />,
});

const CreateChatbot: FC = () => {
  const MAX_FILES = 500;
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [websiteURL, setWebsiteURL] = useState<string>('');
  const [sitemapURL, setSitemapURL] = useState<string>('');
  const [invalidWebsiteMessage, setInvalidWebsiteMessage] =
    useState<string>('');
  const [invalidSitemapMessage, setInvalidSitemapMessage] =
    useState<string>('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [parsing, setParsing] = useState<boolean>(false);
  const [crawlingWebsite, setCrawlingWebsite] = useState<boolean>(false);
  const [crawlingSitemap, setCrawlingSitemap] = useState<boolean>(false);
  const { chatbots, mutate: mutateChatbots } = useChatbots();
  const [stateSources, setStateSources] = useState<StateSourcesType>();

  const { getRootProps, getInputProps, acceptedFiles, inputRef } = useDropzone({
    noClick: false,
    noKeyboard: true,
    maxFiles: MAX_FILES,
    maxSize: 10_000_000_000, //10GB
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/vnd.oasis.opendocument.graphics': ['.odg'],
      'application/vnd.oasis.opendocument.text': ['.odt'],
    },
    onDragEnter: () => {
      setDragging(true);
    },
    onDragLeave: () => {
      setDragging(false);
    },
    onDrop: () => {
      setDragging(false);
    },
    disabled: parsing,
  });

  useEffect(() => {
    if (acceptedFiles?.length > 0) {
      setParsing(true);
      Promise.all(
        acceptedFiles.map(async (file) => {
          return file;
        }),
      ).then((files) => {
        Promise.all(files.map((file) => parseFile(file)))
          .then((sources) => {
            setStateSources({
              ...stateSources,
              files: [
                ...(stateSources?.files || []),
                ...sources.filter((source) => source.key),
              ],
            });
          })
          .then(() => setParsing(false))
          .finally(() => {
            acceptedFiles.length = 0;
            acceptedFiles.slice(0, 0);
            if (inputRef.current) inputRef.current.value = '';
          });
      });
    }
  }, [acceptedFiles, stateSources, inputRef]);

  const handleCrawlWebsite = useCallback(async () => {
    if (!websiteURL || invalidWebsiteMessage) return;
    try {
      setCrawlingWebsite(true);
      const data = await crawlWebsite(websiteURL);
      if (data) {
        const website = {
          name: websiteURL,
          content: data.content,
          characters: data.characters,
          type: 'WEBSITE',
          key: uuidv4(),
        } as StateSourceType;
        setStateSources({
          ...stateSources,
          websites: [...(stateSources?.websites || []), website],
        });
      }
      setCrawlingWebsite(false);
      setWebsiteURL('');
    } catch (error) {
      console.log(error);
      toast.error(`Failed to crawl the website`);
      setCrawlingWebsite(false);
    }
  }, [websiteURL, invalidWebsiteMessage, stateSources]);

  const handleCrawlSitemap = useCallback(async () => {
    if (!sitemapURL || invalidSitemapMessage) return;
    try {
      setCrawlingSitemap(true);
      const data = await crawlSitemap(sitemapURL);
      if (data) {
        const sitemap = {
          name: sitemapURL,
          content: data.content,
          characters: data.characters,
          type: 'SITEMAP',
          key: uuidv4(),
        } as StateSourceType;
        setStateSources({
          ...stateSources,
          sitemaps: [...(stateSources?.sitemaps || []), sitemap],
        });
      }
      setCrawlingSitemap(false);
      setSitemapURL('');
    } catch (error) {
      console.log(error);
      toast.error(`Failed to crawl the website`);
      setCrawlingSitemap(false);
    }
  }, [sitemapURL, invalidSitemapMessage, stateSources]);

  const hasFiles = stateSources?.files?.length || false;
  const hasText = stateSources?.text?.characters || false;
  const hasWebsite = stateSources?.websites?.length || false;
  const hasSitemap = stateSources?.sitemaps?.length || false;

  const hasSources = hasFiles || hasText || hasWebsite || hasSitemap;

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      if (!name) {
        toast.error("Please enter the chatbot's name.");
        setLoading(false);
        return;
      }
      if (!hasSources || !stateSources) {
        toast.error('Please provide sources for the chatbot');
        setLoading(false);
        return;
      }
      const newChatbot = await createChatbot(name, stateSources);
      await mutateChatbots([...(chatbots || []), newChatbot]);
      setLoading(false);
      toast.success('Your chatbot is trained and ready.');
      setTimeout(() => {
        router.push('/chatbots');
      }, 500);
    } catch (error) {
      setLoading(false);
      console.log('Error', error);
    }
  }, [name, hasSources, stateSources, chatbots, mutateChatbots, router]);

  const fileChars =
    stateSources?.files?.reduce((sum, file) => sum + file.characters, 0) || 0;

  return (
    <>
      <AppLayout>
        <div className="mx-auto w-1/2">
          <div className="m-4 text-center text-3xl font-bold">Data Sources</div>
          <div>
            <Tabs defaultValue="files">
              <TabsList className="w-full gap-4">
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="testo">Text</TabsTrigger>
                <TabsTrigger value="sitoweb">Website</TabsTrigger>
              </TabsList>
              <TabsContent value="files">
                <div className="m-auto w-3/4 max-w-md">
                  <label className=" mb-2 mt-4 block text-center text-sm font-medium text-gray-900 dark:text-white">
                    Upload Files
                  </label>
                  <div
                    className={cn(
                      'cursor-pointer rounded-lg border-2 border-dotted p-16 transition duration-300',
                      {
                        ' border-fuchsia-500 bg-fuchsia-500 bg-opacity-[3%]':
                          dragging,
                      },
                    )}
                    {...getRootProps()}
                  >
                    <input {...getInputProps()} />
                    <div
                      className={cn(
                        'flex flex-col items-center justify-center gap-4',
                        { hidden: parsing },
                      )}
                    >
                      <Upload />
                      <div className="items-center justify-center text-center">
                        <p className="text-sm text-gray-600 ">
                          Drag &amp; drop files here, or click to select files
                        </p>
                        <span
                          className="text-xs text-gray-500 dark:text-gray-300"
                          id="file_type_help"
                        >
                          Supported File Types: .txt, .pdf, .doc, .docx, .odt,
                        </span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'flex flex-col items-center justify-center gap-4',
                        { hidden: !parsing },
                      )}
                    >
                      <ClipLoader color={'#a855f7'} />
                    </div>
                  </div>
                  <p
                    className="mt-1 text-center text-sm text-gray-500 dark:text-gray-300"
                    id="file_input_help"
                  >
                    {`NOTE: Uploading a PDF using safari doesn't work, we're
                    looking into the issue. Make sure the text is OCR'd, i.e.
                    you can copy it.`}
                  </p>
                  {hasFiles && (
                    <div className="pt-8">
                      <div>
                        <span className="b-2 font-semibold">
                          Attached Files
                        </span>
                        <span className="ml-1 text-sm text-zinc-500">
                          ({`${fileChars} chars`})
                        </span>
                      </div>
                      {stateSources?.files?.map((source) => (
                        <div key={source.key}>
                          <div className="flex justify-between pb-4">
                            <div>
                              <span>{source.name}</span>
                              <span className="ml-1 text-sm text-zinc-500">
                                ({source.characters} chars)
                              </span>
                            </div>
                            <button className="text-zinc-600 hover:text-zinc-900">
                              <Trash2
                                className="ml-1 h-4 w-4 text-red-600"
                                onClick={() =>
                                  setStateSources({
                                    ...stateSources,
                                    files:
                                      stateSources.files?.filter(
                                        (file) => file.key !== source.key,
                                      ) || [],
                                  })
                                }
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="testo">
                <Card>
                  <CardContent>
                    <div className="pt-8">
                      <Label htmlFor="chatbotName">Chatbot Name</Label>
                      <Input
                        id="chatbotName"
                        value={name}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setName(event.target.value);
                        }}
                      ></Input>
                    </div>
                    <div className="pt-8">
                      <Label htmlFor="text">Data</Label>
                      <Textarea
                        id="text"
                        className="whitespace-pre"
                        value={stateSources?.text?.content || ''}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                          setStateSources({
                            ...stateSources,
                            text: {
                              key: uuidv4(),
                              name: 'text',
                              type: 'TEXT',
                              characters: event.target.value.length,
                              content: event.target.value,
                            } as StateSourceType,
                          });
                        }}
                        rows={15}
                      ></Textarea>
                    </div>
                    {hasText && (
                      <p className="mt-2 h-8 text-center text-sm text-gray-600">
                        {stateSources?.text?.characters} characters
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="sitoweb">
                <Card>
                  <CardContent>
                    <div className="pt-8">
                      <Label
                        htmlFor="crawl"
                        className="my-2 block text-sm font-medium leading-6 text-gray-900"
                      >
                        Crawl
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          id="crawl"
                          value={websiteURL}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            const value = event.target.value;
                            if (validator.isURL(value)) {
                              setInvalidWebsiteMessage('');
                            } else setInvalidWebsiteMessage('Invalid URL');
                            setWebsiteURL(value);
                          }}
                          placeholder="https://www.example.com"
                        ></Input>
                        <Button
                          variant={'plain'}
                          onClick={handleCrawlWebsite}
                          loadingMessage="Crawling..."
                          loading={crawlingWebsite}
                        >
                          {hasWebsite ? 'Fetch more links' : 'Fetch Links'}
                        </Button>
                      </div>
                      <div className="my-2 text-sm text-rose-600">
                        {websiteURL && invalidWebsiteMessage
                          ? invalidWebsiteMessage
                          : null}
                      </div>
                      <span className="py-4 text-sm text-zinc-600">
                        This will crawl all the links starting with the URL (not
                        including files on the website).
                      </span>
                    </div>
                    <div className="my-4 flex items-center">
                      <hr className="w-full border-t border-gray-300" />
                      <span className="whitespace-nowrap px-2 text-gray-600">
                        OR
                      </span>
                      <hr className="w-full border-t border-gray-300" />
                    </div>
                    <div className="pt-2">
                      <Label
                        htmlFor="sitemap"
                        className="my-2 block text-sm font-medium leading-6 text-gray-900"
                      >
                        Submit Sitemap
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          id="sitemap"
                          value={sitemapURL}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            const value = event.target.value;
                            if (validator.isURL(value)) {
                              setInvalidSitemapMessage('');
                            } else setInvalidSitemapMessage('Invalid URL');
                            setSitemapURL(event.target.value);
                          }}
                          placeholder="https://www.example.com/sitemap.xml"
                        ></Input>
                        <Button
                          variant={'plain'}
                          onClick={handleCrawlSitemap}
                          loadingMessage="Crawling..."
                          loading={crawlingSitemap}
                        >
                          {hasSitemap
                            ? 'Load additional sitemap'
                            : 'Load sitemap'}
                        </Button>
                      </div>
                      <div className="my-2 text-sm text-rose-600">
                        {sitemapURL && invalidSitemapMessage
                          ? invalidSitemapMessage
                          : null}
                      </div>
                    </div>
                    <div className="pt-8">
                      <Label
                        htmlFor="exluded_urls"
                        className="my-2 block text-sm font-medium leading-6 text-gray-900"
                      >
                        Included Links
                      </Label>
                      {stateSources?.websites?.map((website) => (
                        <div
                          className="relative mt-2 rounded-md shadow-sm"
                          key={website.key}
                        >
                          <div className="flex items-center">
                            <Input value={website.name} disabled />
                            <p className="ml-1 w-12 text-xs">
                              {website.characters}
                            </p>
                            <button className="text-zinc-600 hover:text-zinc-900">
                              <Trash2
                                className="ml-1 h-4 w-4 text-red-600"
                                onClick={() =>
                                  setStateSources({
                                    ...stateSources,
                                    websites: stateSources.websites?.filter(
                                      (data) => data.key !== website.key,
                                    ),
                                  })
                                }
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                      {stateSources?.sitemaps?.map((sitemap) => (
                        <div
                          className="relative mt-2 rounded-md shadow-sm"
                          key={sitemap.key}
                        >
                          <div className="flex items-center">
                            <Input value={sitemap.name} disabled />
                            <p className="ml-1 w-12 text-xs">
                              {sitemap.characters}
                            </p>
                            <button className="text-zinc-600 hover:text-zinc-900">
                              <Trash2
                                className="ml-1 h-4 w-4 text-red-600"
                                onClick={() =>
                                  setStateSources({
                                    ...stateSources,
                                    sitemaps: stateSources.sitemaps?.filter(
                                      (data) => data.key !== sitemap.key,
                                    ),
                                  })
                                }
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="mt-24">
            <Card>
              <CardHeader>
                <CardTitle>
                  <p className="text-lg">Included Sources:</p>
                </CardTitle>
                <CardDescription>
                  <span className={cn('text-sm', { hidden: !hasFiles })}>
                    {`${pluralize(
                      stateSources?.files?.length || 0,
                      'file',
                      'files',
                    )} (${fileChars} chars)`}
                  </span>
                  <span
                    className={cn('text-sm', {
                      hidden: !hasFiles || !hasText,
                    })}
                  >
                    {` | `}
                  </span>
                  <span className={cn('text-sm', { hidden: !hasText })}>
                    {`${stateSources?.text?.characters} text input chars`}
                  </span>
                  <span
                    className={cn('text-sm', {
                      hidden:
                        (!hasFiles && !hasText) || (!hasSitemap && !hasWebsite),
                    })}
                  >
                    {` | `}
                  </span>
                  <span
                    className={cn('text-sm', {
                      hidden: !hasWebsite && !hasSitemap,
                    })}
                  >
                    {`${
                      (stateSources?.sitemaps?.length || 0) +
                      (stateSources?.websites?.length || 0)
                    } Links`}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full transition duration-300"
                  variant={hasSources ? 'glow' : 'plain'}
                  loading={loading}
                  loadingMessage="creando..."
                  onClick={handleSubmit}
                  disabled={parsing}
                >
                  Create Chatbot
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default CreateChatbot;
