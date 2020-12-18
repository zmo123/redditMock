import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";

import React, { useEffect } from "react";
import { InputField } from "../components/InputField";

import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Layout } from "../components/Layout";
import { useIsAuth } from "../utils/useIsAuth";

export const CreatePost: React.FC<{}> = ({}) => {
	const router = useRouter();
	useIsAuth();
	const [, createPost] = useCreatePostMutation();
	return (
		<Layout variant="small">
			<Formik
				initialValues={{ title: "", text: "" }}
				onSubmit={async (values, { setErrors }) => {
					if (values.title.length == 0) {
						setErrors({ title: "You cannot enter an empty title!" });
					} else if (values.text.length == 0) {
						setErrors({ text: "text field must not be empty!" });
					} else {
						const response = await createPost({ input: values });

						if (!response.error) {
							router.push("/");
						}
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField name="title" placeholder="title" label="Title" />
						<Box mt={4}>
							<InputField
								textarea
								name="text"
								placeholder="text..."
								label="Body"
							/>
						</Box>

						<Button
							mt={4}
							isLoading={isSubmitting}
							type="submit"
							colorScheme="teal"
						>
							Create Post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(CreatePost);
