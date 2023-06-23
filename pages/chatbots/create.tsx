import { useCallback, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Button from '@/components/ui/buttoneEx';

import { FileData } from '@/types/types';
const CreateChatbot = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [pickedFiles, setPickFiles] = useState<FileData[]>([]);

  const createChatbot = useCallback(async () => {}, [pickedFiles]);

  const hasFiles = pickedFiles?.length > 0;
  return (
    <>
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
                <CardHeader>
                  <CardTitle>Files</CardTitle>
                  <CardDescription>Files Description</CardDescription>
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
                {/* <p className="text-sm">1 File(s) (22,924 chars)</p> */}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant={hasFiles ? 'glow' : 'plain'}
                loading={loading}
                loadingMessage="Creating..."
                onClick={createChatbot}
              >
                Create Chatbot
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CreateChatbot;
