import axios from "axios"
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import EmailEditor, { EditorRef, EmailEditorProps } from 'react-email-editor';
import { twMerge } from "tailwind-merge"
import { clsx, ClassValue } from "clsx"

function Demo() {
  const [ image, setImage ] = useState("");
  const [ name, setName ] = useState("");
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);
  const [ file, setFile ] = useState<File>();
  const [ value, setValue ] = useState("")
  const [ subject, setSubject ] = useState("")

  useEffect(()=>{
    axios.get("http://localhost:3000/api/auth/", {
      withCredentials: true
    }).then((res)=>{
      console.log(res.data);
      setName(res.data.name)
      setImage(res.data.image)
      setIsLoggedIn(true);
    })

  }, [])
  const onLogin = async ()=>{
    window.location.href = "http://localhost:3000/api/auth/google";
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>)=>{
    if (!e.target.files) return
    setFile(e.target.files[0])
    const formData = new FormData();
    formData.append('file', e.target.files[0] as File);
    try {
      const response = await axios.post("http://localhost:3000/api/upload/csv", formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      console.log(response.data)
    } catch(error){
      console.log(error);
    }
  }

  const onSendMail = async ()=>{
    const response = await axios.post("http://localhost:3000/api/mail/send", {
      subject: subject
    }, {
      withCredentials: true
    })
  }

  return (
    <div className="min-h-screen h-full w-full flex justify-center items-center flex-col px-10 py-5">
      {image && <img src={image} className="rounded-full h-10 w-10"></img>}
      {name && <p className="mt-2">{name}</p>}
      {!isLoggedIn && <button 
        className="border p-2 min-w-40 rounded-lg bg-slate-200 shadow-md shadow-slate-100 active:shadow-none active:translate-y-0.5"
        onClick={onLogin}
      >
        Login
      </button>}
      {isLoggedIn && <input type="file" accept="text/csv" onChange={handleUpload}></input>}
      <ReactEmailEditor hidden={!isLoggedIn} setValue={setValue} value={value} />
      {isLoggedIn && <input type="text" onChange={(e)=>{setSubject(e.target.value)}} className="border my-5 p-2 min-w-96" />}
      {isLoggedIn && <button 
        className="border p-2 min-w-40 rounded-lg bg-slate-200 shadow-md shadow-slate-100 active:shadow-none active:translate-y-0.5" 
        onClick={onSendMail}
      >
        Send Mail
      </button>}
    </div>
  )
}

export function cn(...classes: ClassValue[]){
  return twMerge(clsx(classes))
}


type ReactEmailEditorProps = {
  props?: EmailEditorProps,
  hidden: boolean,
  setValue: (html: string)=>void
  value: string
}

const ReactEmailEditor = ({ hidden, setValue, value }: ReactEmailEditorProps)=>{
  const emailEditorRef = useRef<EditorRef>(null);

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
      const response = await axios.post("http://localhost:3000/api/upload/template", {
        template: value
      }, {
        withCredentials: true
      })
      console.log(response.data);
    } catch(error){
      console.error(error)
    }
  }

  return (
    <div className={cn('w-full h-full mx-10 border-2 rounded-md', hidden && 'hidden')}>
      <div className='w-full flex justify-center'>
        <button onClick={exportHtml} className='bg-slate-50 border rounded-md shadow m-2 p-2'>Set HTML</button>
        <button onClick={onUpload} className='bg-slate-50 border rounded-md shadow m-2 p-2'>Upload HTML</button>
      </div>

      <EmailEditor ref={emailEditorRef} onReady={onReady} onLoad={onLoad} minHeight={window.innerHeight - 40} options={{
        features: {
          textEditor: {
            tables: true
          }
        }
      }} style={{
        border: '2px solid gray',
        marginTop: '2px'
      }}  />
    </div>
  );
}

export default Demo
