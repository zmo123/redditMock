import { useField } from "formik";
import {
	FormControl,
	FormLabel,
	Input,
	FormErrorMessage,
	Textarea,
} from "@chakra-ui/react";
import React from "react";

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
	name: string;
	label: string;
};

export const InputField: React.FC<InputFieldProps> = ({
	label,
	size: _, //we are not using size..in the props
	...props
}) => {
	const [field, { error }] = useField(props);

	return (
		<FormControl isInvalid={!!error}>
			<FormLabel htmlFor={field.name}>{label}</FormLabel>
			<Input {...field} {...props} id={field.name} />
			{error ? <FormErrorMessage>{error} </FormErrorMessage> : null}
		</FormControl>
	);
};
