import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
	const [{ data, fetching }] = useMeQuery({
		pause: isServer(),
	});

	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	let body = null;

	// data is loading
	if (fetching) {
		//use not logged in
	} else if (!data?.me) {
		body = (
			<>
				<NextLink href="/login">
					<Link mr={2}>Login</Link>
				</NextLink>
				<NextLink href="/register">
					<Link mr={2}>Register</Link>
				</NextLink>
			</>
		);

		//user is logged in
	} else {
		body = (
			<Flex align="center">
				<NextLink href="/create-post">
					<Button colorScheme="teal" as={Link} mr={2}>
						create post
					</Button>
				</NextLink>
				<Box mr={2}>{data.me.username}</Box>
				<Button
					colorScheme="teal"
					variant="solid"
					onClick={() => logout()}
					isLoading={logoutFetching}
				>
					Logout
				</Button>
			</Flex>
		);
	}
	return (
		<Flex
			bg="tan"
			position={"sticky"}
			p={4}
			top={0}
			zIndex={1000}
			alignContent="center"
		>
			<NextLink href="/">
				<Link>
					<Heading>Reddit Mock</Heading>
				</Link>
			</NextLink>
			<Box ml={"auto"}>{body}</Box>
		</Flex>
	);
};
