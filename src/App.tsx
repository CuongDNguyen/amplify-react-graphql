import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API } from "aws-amplify";
import {
    Button,
    Flex,
    Heading,
    Text,
    TextField,
    View,
    withAuthenticator,
} from "@aws-amplify/ui-react";
import { listCustomers } from "./graphql/queries";
import {
    createCustomer as createCustomerMutation,
    deleteCustomer as deleteCustomerMutation,
} from "./graphql/mutations";

interface CustomerType {
    id: string,
    name: string,
    description?: string
}
// @ts-ignore
const App = ({ signOut }) => {
    const [Customers, setCustomers] = useState([]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        const apiData = await API.graphql({ query: listCustomers });
        // @ts-ignore
        const CustomersFromAPI = apiData.data.listCustomers.items;
        setCustomers(CustomersFromAPI);
    }

    async function createCustomer(event: { preventDefault: () => void; target: HTMLFormElement | undefined; }) {
        event.preventDefault();
        const form = new FormData(event.target);
        const data = {
            name: form.get("name"),
            description: form.get("description"),
        };
        await API.graphql({
            query: createCustomerMutation,
            variables: { input: data },
        });
        fetchCustomers();
        // @ts-ignore
        event.target.reset();
    }

    // @ts-ignore
    async function deleteCustomer({ id }) {
        // @ts-ignore
        const newCustomers = Customers.filter((Customer) => Customer.id !== id);
        setCustomers(newCustomers);
        await API.graphql({
            query: deleteCustomerMutation,
            variables: { input: { id } },
        });
    }

    // @ts-ignore
    return (
        <View className="App">
            <Heading level={1}>My Customers App</Heading>
            <View as="form" margin="3rem 0" onSubmit={createCustomer}>
                <Flex direction="row" justifyContent="center">
                    <TextField
                        name="name"
                        placeholder="Customer Name"
                        label="Customer Name"
                        labelHidden
                        variation="quiet"
                        required
                    />
                    <TextField
                        name="description"
                        placeholder="Customer Description"
                        label="Customer Description"
                        labelHidden
                        variation="quiet"
                        required
                    />
                    <Button type="submit" variation="primary">
                        Create Customer
                    </Button>
                </Flex>
            </View>
            <Heading level={2}>Current Customers</Heading>
            <View margin="3rem 0">
                {Customers.map((Customer: CustomerType) => (
                    <Flex
                        key={Customer.id || Customer.name}
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Text as="strong" fontWeight={700}>
                            {Customer.name}
                        </Text>
                        <Text as="span">{Customer.description}</Text>
                        <Button variation="link" onClick={() => deleteCustomer(Customer)}>
                            Delete Customer
                        </Button>
                    </Flex>
                ))}
            </View>
            <Button onClick={signOut}>Sign Out</Button>
        </View>
    );
};

export default withAuthenticator(App);