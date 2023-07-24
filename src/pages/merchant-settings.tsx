import Button from '@/components/ui/button';
import InputFormik from '@/components/ui/forms/inputFormik';
import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
// static data
import Uploader from '@/components/ui/forms/uploaderFormik';
import InputLabel from '@/components/ui/input-label';
import RootLayout from '@/layouts/_root-layout';
import prisma from '@/lib/prisma';
import { userUpdate } from '@/types/schemas';
import axios from 'axios';
import { Form, Formik, FormikHelpers } from 'formik';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useState } from 'react';
import { authOptions } from './api/auth/[...nextauth]';

interface Values {
  name: string;
  wallet: string;
  file: File;
}

interface Props {
  name: string;
  wallet: string;
  avatar: string;
  bucketUrl: string;
}

export const MerchantForm = ({ errors }) => {
  return (
    <>
      {/* Name */}
      <div className="mb-8">
        <InputLabel title="Name" important subTitle="Your brand name" />
        <InputFormik
          id="name"
          name="name"
          error={errors.name}
          type="text"
          placeholder=""
        />
      </div>
      <InputLabel title="Your wallet address" important />
      <InputFormik
        id="wallet"
        name="wallet"
        placeholder=""
        className="mt-4"
        disabled
        error={errors.defaultWallet}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions(context.req)
  );
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });
  return {
    props: {
      name: user.name,
      /* @ts-ignore */
      wallet: session.publicKey,
      avatar: user.avatar,
      bucketUrl: `https://${process.env.BUCKET_URL}/`,
    },
  };
};

const CreateProductPage: NextPageWithLayout = (props: Props) => {
  const [file, setFile] = useState(null);
  const [avatar, setAvatar] = useState(props.avatar);
  const [isAlert, setIsAlert] = useState(true);

  return (
    <RootLayout>
      <NextSeo
        title="Your merchant settings"
        description="Change merchant properties"
      />
      <section className="mx-auto w-full max-w-[1160px] text-sm">
        <h2 className="mb-5 text-lg font-medium dark:text-gray-100 sm:mb-6 lg:mb-7 xl:text-xl">
          Your merchant settings
        </h2>

        <div className="mb-6 gap-16 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8 lg:grid lg:grid-cols-2">
          <div className="mb-8">
            <InputLabel title="Current brand logo" />
            <img className="mt-8 h-44" src={avatar} />
          </div>
          <>
            <div className="mb-8">
              <InputLabel title="Upload new brand logo" />
              <Uploader setFieldValue={setFile} />
            </div>
          </>
        </div>
        <Formik
          initialValues={{
            name: props.name,
            wallet: props.wallet,
            file: null,
          }}
          validationSchema={userUpdate}
          onSubmit={async (
            values: Values,
            { setSubmitting, setStatus, setErrors }: FormikHelpers<Values>
          ) => {
            try {
              let newFile;
              if (file) {
                let { data } = await axios.post('/api/files', {
                  name: file.name,
                  type: file.type,
                });

                const url = data.url;
                await axios.put(url, file, {
                  headers: {
                    'Content-type': file.type,
                    'Access-Control-Allow-Origin': '*',
                  },
                });
                newFile = props.bucketUrl + data.fileName;
              }

              await axios.post('/api/user', {
                name: values.name,
                image: newFile,
              });
              setAvatar(newFile);
              setStatus({ success: 'Success' });
              // Better alerts
              alert('Success');
            } catch (e) {
              console.log(e);
            }
          }}
        >
          {({ errors, isSubmitting }) => (
            <Form>
              <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
                <MerchantForm errors={errors} />
              </div>
              <div className="mt-6">
                <Button
                  type="submit"
                  size="large"
                  shape="rounded"
                  fullWidth={true}
                  className="xs:w-64 md:w-72"
                  isLoading={isSubmitting}
                >
                  Modify
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </RootLayout>
  );
};

export default CreateProductPage;
