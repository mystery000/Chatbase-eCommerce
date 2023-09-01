import JSZip from 'jszip';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import { StateSourceType } from '@/types/types';
import { getDocument } from 'pdfjs-dist/build/pdf';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { extractTextByServer } from './api';

export const parseFile = async (file: File) => {
  return new Promise<StateSourceType>((resolve) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (file.type === 'application/pdf') {
        const loadingTask = getDocument(event.target?.result as ArrayBuffer);
        loadingTask.promise.then(async (pdf) => {
          try {
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              text += content.items
                .map((item) => (item as TextItem).str)
                .join(' ');
            }
            resolve({
              key: uuidv4(),
              name: file.name,
              type: 'FILE',
              characters: text.length,
              content: text,
            } as StateSourceType);
          } catch (error) {
            console.log(error);
          }
        });
      } else if (file.type === 'application/msword') {
        try {
          const extractedText = await extractTextByServer(file);
          resolve({
            key: uuidv4(),
            name: file.name,
            type: 'FILE',
            characters: extractedText.length,
            content: extractedText,
          } as StateSourceType);
        } catch (error) {
          console.log(error);
          resolve({} as StateSourceType);
        }
      } else if (
        file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const arrayBuffer = event.target?.result;
        if (arrayBuffer instanceof ArrayBuffer) {
          mammoth
            .extractRawText({ arrayBuffer: arrayBuffer })
            .then((text) =>
              resolve({
                key: uuidv4(),
                name: file.name,
                type: 'FILE',
                characters: text.value.length,
                content: text.value,
              } as StateSourceType),
            )
            .catch((err) => {
              console.error(err);
              resolve({} as StateSourceType);
            });
        }
      } else if (file.type === 'application/vnd.oasis.opendocument.text') {
        const data = event.target?.result;
        if (data instanceof ArrayBuffer) {
          const zip = new JSZip();
          zip
            .loadAsync(data)
            .then((zip) => {
              if (zip.files['content.xml']) {
                zip
                  .file('content.xml')
                  ?.async('string')
                  .then((content) => {
                    resolve({
                      key: uuidv4(),
                      name: file.name,
                      type: 'FILE',
                      characters: content.length,
                      content: content,
                    } as StateSourceType);
                  });
              }
            })
            .catch((err) => resolve({} as StateSourceType));
        } else resolve({} as StateSourceType);
      } else if (file.type === 'text/plain') {
        const arrayBuffer = event.target?.result;
        if (arrayBuffer instanceof ArrayBuffer) {
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(arrayBuffer);
          resolve({
            key: uuidv4(),
            name: file.name,
            type: 'FILE',
            characters: text.length,
            content: text,
          } as StateSourceType);
        }
      } else {
        resolve({} as StateSourceType);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};
