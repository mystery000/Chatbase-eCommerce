import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useState, ChangeEvent, useEffect, useCallback } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

import cn from 'classnames';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Upload } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { useDropzone } from 'react-dropzone';
const Button = dynamic(() => import('@/components/ui/buttoneEx'));
const PacmanLoader = dynamic(() => import('@/components/loaders/PacmanLoader'));
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import validator from 'validator';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { retrainChatbot } from '@/lib/api';
import { ClipLoader } from 'react-spinners';
import { parseFile } from '@/lib/parse-file';
import useSources from '@/lib/hooks/use-sources';
import { crawlWebsite } from '@/lib/integrations/website';
import { crawlSitemap } from '@/lib/integrations/sitemap';
import { StateSourceType, StateSourcesType } from '@/types/types';

const RetrainChatbot: NextPage<{ chatbotId: string }> = ({ chatbotId }) => {
  const MAX_FILES = 500;
  const { sources } = useSources();
  const [parsing, setParsing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [training, setTraining] = useState(false);
  const [stateSources, setStateSources] = useState<StateSourcesType>();
  const [websiteURL, setWebsiteURL] = useState('');
  const [sitemapURL, setSitemapURL] = useState('');
  const [crawlingWebsite, setCrawlingWebsite] = useState(false);
  const [crawlingSitemap, setCrawlingSitemap] = useState(false);
  const [invalidWebsiteMessage, setInvalidWebsiteMessage] = useState('');
  const [invalidSitemapMessage, setInvalidSitemapMessage] = useState('');

  useEffect(() => {
    if (!sources) return;
    const findText = sources.find((source) => source.type === 'TEXT');
    setStateSources({
      files: sources
        .filter((source) => source.type === 'FILE')
        .map(
          (source) =>
            ({
              key: source.source_id,
              name: source.name,
              type: source.type,
              content: source.content,
              characters: source.characters,
            } as StateSourceType),
        ),
      text: findText
        ? ({
            key: findText.source_id,
            name: findText.name,
            type: findText.type,
            content: findText.content,
            characters: findText.characters,
          } as StateSourceType)
        : findText,
      websites: sources
        .filter((source) => source.type === 'WEBSITE')
        .map(
          (source) =>
            ({
              key: source.source_id,
              name: source.name,
              type: source.type,
              content: source.content,
              characters: source.characters,
            } as StateSourceType),
        ),
      sitemaps: sources
        .filter((source) => source.type === 'SITEMAP')
        .map(
          (source) =>
            ({
              key: source.source_id,
              name: source.name,
              type: source.type,
              content: source.content,
              characters: source.characters,
            } as StateSourceType),
        ),
    });
  }, [sources]);

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

  const removeSource = useCallback(
    (source: StateSourceType) => {
      if (!stateSources) return;
      switch (source.type) {
        case 'FILE':
          setStateSources({
            ...stateSources,
            files: stateSources.files?.filter(
              (file) => file.key !== source.key,
            ),
          });

          break;
        case 'SITEMAP':
          setStateSources({
            ...stateSources,
            sitemaps: stateSources.sitemaps?.filter(
              (file) => file.key !== source.key,
            ),
          });
          break;
        case 'WEBSITE':
          setStateSources({
            ...stateSources,
            websites: stateSources.websites?.filter(
              (file) => file.key !== source.key,
            ),
          });
          break;
      }
    },
    [stateSources],
  );
  const handleCrawlWebsite = useCallback(async () => {
    if (!websiteURL || invalidWebsiteMessage) return;
    try {
      setCrawlingWebsite(true);
      const data = await crawlWebsite(websiteURL);
      const key = uuidv4();
      if (data) {
        const website = {
          name: websiteURL,
          content: data.content,
          characters: data.characters,
          type: 'WEBSITE',
          key: key,
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
      const key = uuidv4();
      if (data) {
        const sitemap = {
          name: sitemapURL,
          content: data.content,
          characters: data.characters,
          type: 'SITEMAP',
          key: key,
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

  const handleRetrain = useCallback(async () => {
    if (!stateSources) return;
    setTraining(true);
    try {
      await retrainChatbot(chatbotId, stateSources);
      toast.success('Successfully updated');
    } catch (error) {
      console.log(error);
      toast.error('Failed');
    } finally {
      setTraining(false);
    }
  }, [stateSources, chatbotId]);

  if (!sources || !stateSources) return <PacmanLoader />;

  const hasFiles = stateSources?.files?.length || false;
  const hasText = stateSources?.text?.characters || false;
  const hasWebsite = stateSources?.websites?.length || false;
  const hasSitemap = stateSources?.sitemaps?.length || false;

  const file_chars =
    stateSources.files?.reduce((sum, source) => sum + source.characters, 0) ||
    0;
  const text_chars = stateSources?.text?.characters || 0;

  const links =
    (stateSources.sitemaps?.length || 0) + (stateSources.websites?.length || 0);

  return (
    <div className="mx-auto w-full">
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
                    <span className="b-2 font-semibold">Attached Files</span>
                    <span className="ml-1 text-sm text-zinc-500">
                      ({`${file_chars} chars`})
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
                            onClick={() => removeSource(source)}
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
            <div className="mx-auto mt-8 w-2/3">
              <Textarea
                id="text"
                className="whitespace-pre"
                value={stateSources?.text?.content || ''}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                  if (event.target.value.length > 0) {
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
                  } else {
                    setStateSources({
                      files: stateSources.files,
                      websites: stateSources.websites,
                      sitemaps: stateSources.websites,
                    } as StateSourcesType);
                  }
                }}
                rows={15}
              />
              <p className="h-8 text-center text-sm text-gray-600">
                {text_chars} characters
              </p>
            </div>
          </TabsContent>
          <TabsContent value="sitoweb">
            <div className="mx-auto w-2/3">
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <div className="mx-auto my-12 w-1/2">
        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-bold text-lg">Included Sources</p>
            </CardTitle>
            <CardDescription>
              <div className="flex space-x-3 py-1">
                <div className="text-sm text-zinc-700">{`${stateSources.files?.length} File(s) (${file_chars}) chars`}</div>
                <div className="text-sm text-zinc-700">{` | `}</div>
                <div className="text-sm text-zinc-700">{`${text_chars} text input chars`}</div>
                <div className="text-sm text-zinc-700">{` | `}</div>
                <div className="text-sm text-zinc-700">{`${links} Links`}</div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              loadingMessage="Traning..."
              variant={'plain'}
              onClick={handleRetrain}
              disabled={training}
            >
              {training ? 'Training...' : 'Retrain Chatbot'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RetrainChatbot;
