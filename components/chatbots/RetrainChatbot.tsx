import dynamic from 'next/dynamic';
import { useState, ChangeEvent, useEffect } from 'react';

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

import { Source } from '@/types/database';
import useSources from '@/lib/hooks/use-sources';

type stateSourcesType = {
  files?: Source[];
  text?: Source;
  website?: Source[];
  sitemap?: Source[];
};

const RetrainChatbot = () => {
  const { sources, mutate: mutateSources } = useSources();
  const [dragging, setDragging] = useState(false);
  const [pickedFiles, setPickedFiles] = useState<File[]>([]);
  const [stateSources, setStateSources] = useState<stateSourcesType>();

  useEffect(() => {
    if (!sources) return;
    setStateSources({
      files: sources.filter((source) => source.type === 'FILE') || [],
      text: sources.find((source) => source.type === 'TEXT'),
      website: sources.filter((source) => source.type === 'WEBSITE') || [],
      sitemap: sources.filter((source) => source.type === 'SITEMAP') || [],
    });
  }, [sources]);

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    noKeyboard: true,
    maxFiles: 1000,
    maxSize: 1_000_000,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/vnd.oasis.opendocument.graphics': ['.odg'],
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
  });

  useEffect(() => {
    if (acceptedFiles?.length > 0) {
      console.log(acceptedFiles);
    }
  }, [acceptedFiles]);
  if (!sources || !stateSources) return <PacmanLoader />;

  const handleRetrain = () => {
    console.log(stateSources.text);
  };

  const hasFiles = pickedFiles?.length > 0;

  const file_chars =
    stateSources.files?.reduce((sum, source) => sum + source.characters, 0) ||
    0;
  const text_chars = stateSources?.text?.characters || 0;

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
            <div className="m-auto w-1/2 max-w-md">
              <label className=" mb-2 mt-4 block text-center text-sm font-medium text-gray-900 dark:text-white">
                Upload Files
              </label>
              <div
                className={cn(
                  'cursor-pointer rounded-lg border-2 border-dotted p-16 transition duration-300',
                  {
                    'border-fuchsia-600 bg-fuchsia-500 bg-opacity-[3%]':
                      dragging,
                    'border-fuchsia-600 bg-fuchsia-500 bg-opacity-[7%]':
                      hasFiles,
                  },
                )}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-4">
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
              </div>
              <p
                className="mt-1 text-center text-sm text-gray-500 dark:text-gray-300"
                id="file_input_help"
              >
                {`NOTE: Uploading a PDF using safari doesn't work, we're looking
                  into the issue. Make sure the text is OCR'd, i.e. you can copy
                  it.`}
              </p>
              <div className="pt-8">
                <div>
                  <span className="b-2 font-semibold">Attached Files</span>
                  <span className="ml-1 text-sm text-zinc-500">
                    ({file_chars} chars)
                  </span>
                </div>
                {stateSources.files &&
                  stateSources.files.map((source) => (
                    <div key={source.source_id}>
                      <div className="flex justify-between pb-4">
                        <div>
                          <span>{source.name}</span>
                          <span className="ml-1 text-sm text-zinc-500">
                            ({source.characters} chars)
                          </span>
                        </div>
                        <button className="text-zinc-600 hover:text-zinc-900">
                          <Trash2 className="ml-1 h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="testo">
            <div className="mx-auto mt-8 w-2/3">
              <Textarea
                className="my-2 w-full min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white p-1 px-3 text-gray-900 shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 sm:text-sm"
                rows={20}
                value={stateSources.text?.content}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  if (!stateSources.text) return;
                  setStateSources({
                    ...stateSources,
                    text: {
                      ...stateSources.text,
                      content: e.target.value,
                      characters: e.target.value.length,
                    },
                  });
                }}
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
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {}}
                        placeholder="https://www.example.com"
                      ></Input>
                      <Button variant={'plain'} loadingMessage="Crawling...">
                        Fetch Links
                      </Button>
                    </div>
                    <div className="my-2 text-sm text-rose-600"></div>
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
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {}}
                        placeholder="https://www.example.com/sitemap.xml"
                      ></Input>
                      <Button variant={'plain'} loadingMessage="Fetching...">
                        Load sitemap
                      </Button>
                    </div>
                  </div>
                  <div className="pt-8">
                    <Label
                      htmlFor="exluded_urls"
                      className="my-2 block text-sm font-medium leading-6 text-gray-900"
                    >
                      Included Links
                    </Label>
                    {sources
                      .filter((source) => source.type === 'WEBSITE')
                      .map((source) => (
                        <div
                          className="relative mt-2 rounded-md shadow-sm"
                          key={source.source_id}
                        >
                          <div className="flex items-center">
                            <Input value={source.name} disabled />
                            <p className="ml-1 w-12 text-xs">
                              {source.characters}
                            </p>
                            <button className="text-zinc-600 hover:text-zinc-900">
                              <Trash2 className="ml-1 h-4 w-4 text-red-600" />
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
                <div className="text-sm text-zinc-700">{`${stateSources.text?.characters} text input chars`}</div>
                <div className="text-sm text-zinc-700">{` | `}</div>
                <div className="text-sm text-zinc-700">{`${
                  (stateSources.sitemap?.length || 0) +
                  (stateSources.website?.length || 0)
                } Links`}</div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              loadingMessage="Traning..."
              variant={'plain'}
              onClick={handleRetrain}
            >
              Retrain Chatbot
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RetrainChatbot;
