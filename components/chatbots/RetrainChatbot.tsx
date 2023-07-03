import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { FC, useCallback, useState, ChangeEvent } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import cn from 'classnames';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { pluralize } from '@/lib/utils';
import toast from 'react-hot-toast';
import { createChatbot } from '@/lib/api';
import useChatbots from '@/lib/hooks/use-chatbots';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
const Button = dynamic(() => import('@/components/ui/buttoneEx'));

const RetrainChatbot: FC = () => {
  const MAX_FILES = 5;
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  // Data Sources files, text, website, sitemap, QA
  const [pickedFiles, setPickFiles] = useState<File[]>([]);
  const [text, setText] = useState<string>('');

  const { chatbots, mutate: mutateChatbots } = useChatbots();

  const handleClick = useCallback(async () => {
    setLoading(true);
    try {
      if (!pickedFiles.length) {
        toast.error('No files selected');
        setLoading(false);
        return;
      }
      const newChatbot = await createChatbot(pickedFiles[0].name, pickedFiles);
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
  }, [pickedFiles]);

  const hasFiles = pickedFiles?.length || 0;

  const handleFileEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const fileLength = files?.length || 0;
    if (fileLength > MAX_FILES) {
      toast.error(`You can only add a maximum of ${MAX_FILES} files`);
      return;
    }
    setPickFiles(files);
  };

  return (
    <>
      <div className="mx-auto w-full">
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
                        accept="text/plain, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                      value={text}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setText(event.target.value);
                      }}
                    ></Input>
                  </div>
                  <div className="pt-8">
                    <Label htmlFor="text">Data</Label>
                    <Textarea
                      id="text"
                      className="h-56 whitespace-pre"
                      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {}}
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
                        value={text}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setText(event.target.value);
                        }}
                        placeholder="https://www.example.com"
                      ></Input>
                      <Button variant={'plain'}>Fetch links</Button>
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
                        value={text}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setText(event.target.value);
                        }}
                        placeholder="https://www.example.com/sitemap.xml"
                      ></Input>
                      <Button variant={'plain'} loadingMessage="">
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
                <p className={cn('text-sm', { hidden: !hasFiles })}>
                  {`${pluralize(
                    pickedFiles?.length || 0,
                    'file',
                    'files',
                  )} added`}
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant={hasFiles ? 'glow' : 'plain'}
                loading={loading}
                loadingMessage="Training..."
                onClick={handleClick}
              >
                Retrain Chatbot
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default RetrainChatbot;