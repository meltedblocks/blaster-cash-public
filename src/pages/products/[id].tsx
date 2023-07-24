import Button from '@/components/ui/button';
import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useState } from 'react';
// static data
import ErrorBox from '@/components/ErrorBox';
import InputFormik from '@/components/ui/forms/inputFormik';
import Uploader from '@/components/ui/forms/uploaderFormik';
import InputLabel from '@/components/ui/input-label';
import RootLayout from '@/layouts/_root-layout';
import prisma from '@/lib/prisma';
import Errors from '@/utils/Errors';
import axios from 'axios';
import { Form, Formik, FormikHelpers } from 'formik';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import * as Yup from 'yup';
import { authOptions } from '../api/auth/[...nextauth]';

interface Values {
  name: string;
  description: string;
  file: File;
}

interface CreateProduct {
  name?: string;
  description?: string;
  image?: string;
  id?: string;
  bucketUrl: string;
}

const ProductSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required(),
  description: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .notRequired(),
  // logo: Yup.string().url('Invalid image').notRequired(),
});

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.query.id !== 'new') {
    const productId = context.query.id as string;
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions(context.req)
    );
    const products = await prisma.product.findMany({
      where: {
        id: productId,
        /* @ts-ignore */
        userId: session.user.id,
      },
    });

    if (products && products.length > 0) {
      const product = products[0];
      return {
        props: {
          name: product.name,
          description: product.description,
          image: product.image,
          id: product.id,
          bucketUrl: process.env.BUCKET_URL,
        },
      };
    }
  }

  return {
    props: {
      name: null,
      description: null,
      image: null,
      id: null,
      bucketUrl: process.env.BUCKET_URL,
    },
  };
};

export const CreateProduct = ({ errors }) => {
  return (
    <>
      {/* Name */}
      <div className="mb-8">
        <InputLabel
          title="Name"
          important
          subTitle="The description will be included on the item's detail page underneath its image."
        />
        <InputFormik id="name" name="name" error={errors.name} type="text" />
      </div>

      {/* Description */}
      <div className="mb-8">
        <InputLabel
          title="Description"
          subTitle="The description will be included on the item's detail page underneath its image."
        />
        <InputFormik
          type="text"
          id="description"
          name="description"
          error={errors.description}
        />
      </div>
    </>
  );
};

const CreateProductPage: NextPageWithLayout = (props: CreateProduct) => {
  const [file, setFile] = useState(null);
  const [errorText, setErrorText] = useState('');
  const router = useRouter();
  return (
    <>
      <NextSeo title="Create Product" description="Create a product" />
      <section className="mx-auto w-full max-w-[1160px] text-sm">
        <h2 className="mb-5 text-lg font-medium dark:text-gray-100 sm:mb-6 lg:mb-7 xl:text-xl">
          Create a new product
        </h2>
        {errorText && (
          <ErrorBox errorText={errorText} setErrorText={setErrorText} />
        )}
        <Formik
          initialValues={{
            name: props.name || '',
            description: props.description || '',
            file: null,
          }}
          validationSchema={ProductSchema}
          onSubmit={async (
            values: Values,
            { setSubmitting, setStatus }: FormikHelpers<Values>
          ) => {
            try {
              let newFile;
              if (file) {
                let { data } = await axios.post('/api/files', {
                  name: file.name,
                  type: file.type,
                });

                const url = data.url;
                try {
                  await axios.put(url, file, {
                    headers: {
                      'Content-type': file.type,
                      'Access-Control-Allow-Origin': '*',
                    },
                  });
                } catch (e) {
                  setErrorText(Errors.UPLOAD_FILE);
                  return;
                }

                newFile = `https://${props.bucketUrl}/` + data.fileName;
              }

              let url = props.id
                ? `/api/product/${props.id}`
                : '/api/product/new';

              let result = await axios.post(url, {
                name: values.name || props.name,
                image: newFile || props.image,
                description: values.description || props.description,
              });
              setStatus({ success: 'Success' });

              // Better alerts
              router.push('/products');
            } catch (e) {
              console.log(e);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
                <div
                  className={
                    props.image &&
                    'mb-6 gap-16 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8 lg:grid lg:grid-cols-2'
                  }
                >
                  {props.image && (
                    <>
                      <div className="mb-8">
                        <InputLabel title="Current product image" />
                        <img className="mt-8 h-44" src={props.image} />
                      </div>
                    </>
                  )}
                  <div className="mb-8">
                    <InputLabel title="Upload product image" />
                    <Uploader setFieldValue={setFile} />
                  </div>
                </div>
                <CreateProduct errors={errors} />
              </div>
              <div className="mt-6">
                <Button
                  size="large"
                  shape="rounded"
                  fullWidth={true}
                  className="xs:w-64 md:w-72"
                  type="submit"
                  isLoading={isSubmitting}
                >
                  Create Product
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </>
  );
};

CreateProductPage.getLayout = function getLayout(page) {
  return <RootLayout>{page}</RootLayout>;
};

export default CreateProductPage;
