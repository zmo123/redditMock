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
	textarea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({
	label,
	size: _, //we are not using size..in the props
	textarea,
	...props
}) => {
	let InputorTextarea: React.ElementType;

	if (textarea) {
		InputorTextarea = Textarea;
	} else {
		InputorTextarea = Input;
	}
	const [field, { error }] = useField(props);

	return (
		<FormControl isInvalid={!!error}>
			<FormLabel htmlFor={field.name}>{label}</FormLabel>
			<InputorTextarea {...field} {...props} id={field.name} />
			{error ? <FormErrorMessage>{error} </FormErrorMessage> : null}
		</FormControl>
	);
};
