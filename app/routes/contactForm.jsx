import { Form, useActionData, useSubmit, useTransition } from "@remix-run/react";
import cs from "classnames";
import { useEffect, useRef } from "react";
import { Element } from "react-scroll";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Call } from "~/components/icons";
import { Quote } from "~/components/Quote";
import { useRootContext } from "~/context/root-context";

export default function ContactForm({ contactQuote, profileImage, email, message, name, sendDone, sendLoading, subject, phone, }) {
  const actionData = useActionData();
  const transition = useTransition();
  const formRef = useRef();
  const messageRef = useRef();

  const { language } = useRootContext()
  const { executeRecaptcha } = useGoogleReCaptcha();

  const submit = useSubmit()

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = await executeRecaptcha("homepage")
    const form = event.target;
    // get the formData from that form
    const formData = new FormData(form);
    formData.set("captcha", token);

    submit(formData, {
      method: form.getAttribute("method") ?? form.method,
      action: form.getAttribute("action") ?? form.action,
    });
  }


  const text =
    transition.state === "submitting"
      ? sendLoading
      : sendDone;


  useEffect(() => {
    if (!transition.submission && (actionData?.success || actionData?.error)) {
      formRef.current?.reset();
      messageRef.current?.scrollIntoView();
    }


  }, [actionData?.error, actionData?.success, transition.submission])


  return (
    <>
      <div className='grid'>
        <div className="grid__quote">
          <Quote {...contactQuote} />
        </div>
        <div className="grid__name">
          <h2 className="contact__heading">Hana Alexanderová</h2>
          <div className="row contact__phone">
            <Call className="contact__icon fill--primary-dark" />
            <h3>{phone}</h3>
          </div>
        </div>
        <div className="grid__image" style={{ background: `no-repeat center right/cover url("${profileImage?.data?.attributes?.url}")` }} />

        <Element name="section__contact">

          <main>
            <Form ref={formRef} method='post' className='form column' action={`/?lang=${language}`} onSubmit={handleSubmit}>
              <input className="form__input" name="name" placeholder={name} id="name" />
              <input className="form__input" name="subject" placeholder={subject} id="subject" />
              <input className="form__input" name="email" placeholder={email} id="email" />
              <textarea className="form__input form__text-area" name="msg" placeholder={message} id="msg" />
              <input type="submit" href="#" className="form__button" id="submit" value={text} />
            </Form>
          </main>
        </Element>
      </div>
      <div className="form__messages" ref={messageRef}>
        {(actionData?.errors || actionData?.success) &&
          <div className={cs("message row", { "message--error": actionData?.errors, "message--success": actionData?.success })}>
            <span className="text">{actionData?.success || Object.values(actionData?.errors)?.[0]}</span>
          </div>}
      </div>
    </>
  )
}
