import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { FC, useCallback, useState, ChangeEvent } from 'react';

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
import { Trash2 } from 'lucide-react';
import { pluralize } from '@/lib/utils';
import { createChatbot } from '@/lib/api';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import useChatbots from '@/lib/hooks/use-chatbots';
import { Textarea } from '@/components/ui/textarea';
const Button = dynamic(() => import('@/components/ui/buttoneEx'));
import { crwalWebsiteContentSize } from '@/lib/integrations/website';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
const PacmanLoader = dynamic(() => import('@/components/loaders/PacmanLoader'));
const AppLayout = dynamic(() => import('@/components/layouts/AppLayout'), {
  loading: () => <PacmanLoader />,
});

const CreateChatbot: FC = () => {
  const MAX_FILES = 5;
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  // Data Sources files, text, website, sitemap, QA
  const [pickedFiles, setPickFiles] = useState<File[]>([]);
  const [name, setName] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [crawlURL, setCrawlURL] = useState<string>('');
  const [crawlURLs, setCrawlURLs] = useState<
    { size: number; url: string; id: string }[]
  >([]);
  const [crawling, setCrawling] = useState<boolean>(false);
  const [sitemap, setSitemap] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { chatbots, mutate: mutateChatbots } = useChatbots();

  const hasFiles = pickedFiles?.length || false;
  const hasText = text.length;
  const hasWebsiteOrSitemapURL = crawlURLs.length;
  const hasSources = hasFiles || hasText || hasWebsiteOrSitemapURL;

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      if (!name) {
        toast.error("Please enter the chatbot's name.");
        setLoading(false);
        return;
      }
      if (!hasSources) {
        toast.error('Please add your sources');
        setLoading(false);
        return;
      }

      const newChatbot = await createChatbot(
        name,
        pickedFiles || [],
        text || '',
        crawlURLs.map((data) => data.url),
      );
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
  }, [pickedFiles, name, text, crawlURLs, hasSources]);

  const handleFileEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.files);
    const files = Array.from(event.target.files || []);
    const fileLength = files?.length || 0;
    if (fileLength > MAX_FILES) {
      toast.error(`You can only add a maximum of ${MAX_FILES} files`);
      return;
    }
    setPickFiles(files);
  };

  const onRemoveSelected = (id: string) => {
    console.log(id);
    setCrawlURLs((state) => state.filter((data) => data.id !== id));
  };

  const crawlWebsiteHandler = async () => {
    if (!crawlURL || errorMessage) return;
    try {
      setCrawling(true);
      const contentSize = await crwalWebsiteContentSize(crawlURL);
      setCrawlURLs((state) => [
        ...state,
        { size: contentSize || 0, url: crawlURL, id: uuidv4() },
      ]);
      setCrawling(false);
      setCrawlURL('');
    } catch (error) {
      console.log(error);
      toast.error(`Failed to crawl due to ${error}`);
      setCrawling(false);
    }
  };

  const crawlSiteMapHandler = () => {};

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
                <Card>
                  <CardHeader className="text-center ">
                    <CardTitle>Upload File</CardTitle>
                    <CardDescription>
                      NOTE: Uploading a PDF using safari doesn't work, we're
                      looking into the issue.
                      <br /> Make sure the text is OCR, i.e. you can copy it.
                    </CardDescription>
                    <CardContent>
                      <div className="mt-4 w-full">
                        <Input
                          type="file"
                          accept=".txt, .pdf, .doc, .docx, .odt, .odg, .ods, .odp, .odf"
                          onChange={handleFileEvent}
                          multiple
                        />
                      </div>
                    </CardContent>
                  </CardHeader>
                </Card>
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
                        className="h-56 whitespace-pre"
                        value={text}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                          setText(event.target.value);
                        }}
                      ></Textarea>
                    </div>
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
                          value={crawlURL}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            const value = event.target.value;
                            if (validator.isURL(value)) {
                              setErrorMessage('');
                            } else setErrorMessage('Invalid URL');
                            setCrawlURL(value);
                          }}
                          placeholder="https://www.example.com"
                        ></Input>
                        <Button
                          variant={'plain'}
                          onClick={crawlWebsiteHandler}
                          loadingMessage="Crawling..."
                          loading={crawling}
                        >
                          {crawlURL.length > 1
                            ? 'Fetch more links'
                            : 'Fetch Links'}
                        </Button>
                      </div>
                      <div className="my-2 text-sm text-rose-600">
                        {crawlURL && errorMessage ? errorMessage : null}
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
                          value={sitemap}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setSitemap(event.target.value);
                          }}
                          placeholder="https://www.example.com/sitemap.xml"
                        ></Input>
                        <Button
                          variant={'plain'}
                          loadingMessage="Fetching..."
                          onClick={crawlSiteMapHandler}
                        >
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
                      {crawlURLs.map((data) => (
                        <div
                          className="relative mt-2 rounded-md shadow-sm"
                          key={data.id}
                        >
                          <div className="flex items-center">
                            <Input value={data.url} disabled />
                            <p className="ml-1 w-12 text-xs">{data.size}</p>
                            <button className="text-zinc-600 hover:text-zinc-900">
                              <Trash2
                                className="ml-1 h-4 w-4 text-red-600"
                                onClick={() => onRemoveSelected(data.id)}
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
                  <p className="text-bold text-lg">Included Sources</p>
                </CardTitle>
                <CardDescription>
                  <span className={cn('text-sm', { hidden: !hasFiles })}>
                    {`${pluralize(
                      pickedFiles?.length || 0,
                      'file',
                      'files',
                    )} added`}
                  </span>
                  <span
                    className={cn('text-sm', {
                      hidden:
                        !hasFiles || (!hasText && !hasWebsiteOrSitemapURL),
                    })}
                  >
                    {` | `}
                  </span>
                  <span className={cn('text-sm', { hidden: !hasText })}>
                    {`${text.length} text input chars`}
                  </span>
                  <span
                    className={cn('text-sm', {
                      hidden: !hasText || !hasWebsiteOrSitemapURL,
                    })}
                  >
                    {` | `}
                  </span>
                  <span
                    className={cn('text-sm', {
                      hidden: !hasWebsiteOrSitemapURL,
                    })}
                  >
                    {`${crawlURLs.length} Links`}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant={hasSources ? 'glow' : 'plain'}
                  loading={loading}
                  loadingMessage="creando..."
                  onClick={handleSubmit}
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
