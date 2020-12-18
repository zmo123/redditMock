import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Box, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";

const Index = () => {
	const [{ data }] = usePostsQuery({
		variables: {
			limit: 10,
		},
	});
	return (
		<>
			<Layout>
				<Flex align="center">
					<Heading>Reddit Mock</Heading>
					<NextLink href="/create-post">
						<Link ml="auto">create post</Link>
					</NextLink>
				</Flex>
				<br />
				{!data ? (
					<div>loading...</div>
				) : (
					<Stack spacing={8}>
						{data.posts.map((p) => (
							<Box key={p.id} p={5} shadow="md" borderWidth="1px">
								<Heading fontSize="xl">{p.title}</Heading>
								<Text mt={4}>{p.textSnippet}</Text>
							</Box>
						))}
					</Stack>
				)}
			</Layout>
		</>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
