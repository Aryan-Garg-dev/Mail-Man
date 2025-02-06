import axios from 'axios';
import React from 'react'
import EmailEditor, { EditorRef, EmailEditorProps } from 'react-email-editor';
import { cn } from '../Demo';
import { axiosInstance } from '../lib/axios';

type ReactEmailEditorProps = {
  props?: EmailEditorProps,
  hidden: boolean,
  setValue: (html: string)=>void
  value: string
}

const ReactEmailEditor = ({ hidden, setValue, value }: ReactEmailEditorProps)=>{
  const emailEditorRef = React.useRef<EditorRef>(null);

  const exportHtml = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { design, html } = data;
      setValue(html.replace(/[\n\r]+/g, '').replace(/"/g, "'"))
      console.log(html.replace(/[\n\r]+/g, '').replace(/"/g, "'"));
      alert('exportHtml');
    });
  };

  const onDesignLoad = (data) => {
    console.log('onDesignLoad', data);
  };

  const onLoad: EmailEditorProps['onLoad'] = (unlayer) => {
    console.log('onLoad', unlayer);
    // unlayer.addEventListener('design:loaded', onDesignLoad);
    // unlayer.loadDesign(sample);
  };

  const onReady: EmailEditorProps['onReady'] = (unlayer) => {
    console.log('onReady', unlayer);
  };

  const onUpload = async ()=>{
    try {
      const response = await axiosInstance.post("/upload/template", {
        template: value
      });
      console.log(response.data);
    } catch(error){
      console.error(error)
    }
  }

  return (
    <div className={cn('w-full h-full border-2 rounded-md', hidden && 'hidden')}>
      <div className='w-full flex justify-center'>
        <button onClick={exportHtml} className='bg-slate-50 border rounded-md shadow m-2 p-2'>Set HTML</button>
        <button onClick={onUpload} className='bg-slate-50 border rounded-md shadow m-2 p-2'>Upload HTML</button>
      </div>

      <EmailEditor ref={emailEditorRef} onReady={onReady} onLoad={onLoad} minHeight={window.innerHeight - 40} options={{
        features: {
          textEditor: {
            tables: true,
          }
        }
      }} style={{
        border: '2px solid gray',
        marginTop: '2px'
      }}  />
    </div>
  );
}

export default ReactEmailEditor
