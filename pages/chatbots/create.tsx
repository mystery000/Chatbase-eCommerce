import { FC, useCallback, useState } from 'react';

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
import Button from '@/components/ui/buttoneEx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { pluralize } from '@/lib/utils';
import toast from 'react-hot-toast';
import { createChatbot } from '@/lib/api';
import useChatbots from '@/lib/hooks/use-chatbots';
import { useRouter } from 'next/router';
import NavbarLayout from '@/components/NavbarLayout';

const CreateChatbot: FC = () => {
  const MAX_FILES = 5;
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [pickedFiles, setPickFiles] = useState<File[]>([]);
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
      toast.success('Chatbot created successfully.');
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
      <NavbarLayout>
        <div className="mx-auto w-1/2">
          <div className="m-4 text-center text-3xl font-bold">Data Sources</div>
          <div>
            <Tabs defaultValue="files">
              <TabsList className="w-full gap-4">
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="testo">Text</TabsTrigger>
                <TabsTrigger value="sitoweb">Website</TabsTrigger>
                <TabsTrigger value="domande">Q&A</TabsTrigger>
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
                  <CardHeader>
                    <CardTitle>Testo</CardTitle>
                    <CardDescription>Text Description</CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
              <TabsContent value="sitoweb">
                <Card>
                  <CardHeader>
                    <CardTitle>Website</CardTitle>
                    <CardDescription>Website Description</CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
              <TabsContent value="domande">
                <Card>
                  <CardHeader>
                    <CardTitle>domanda e risposta</CardTitle>
                    <CardDescription>
                      Descrizione di domande e risposte
                    </CardDescription>
                  </CardHeader>
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
                  loadingMessage="creando..."
                  onClick={handleClick}
                >
                  Create Chatbot
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </NavbarLayout>
    </>
  );
};

export default CreateChatbot;
