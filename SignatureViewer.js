import React, { useEffect, useState } from 'react';
import { View, Image, Text, ScrollView, StyleSheet } from 'react-native';

const SignatureViewer = ({ signatureId }) => {
    const [signatures, setSignatures] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the signatures from the backend
        fetch(`http://192.168.119.1:8080/signatures/view/${signatureId}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.message === "Signatures retrieved successfully") {
                    setSignatures(data);
                } else {
                    setError(data.message);
                }
            })
            .catch((error) => {
                console.error(error);
                setError("Failed to fetch signatures");
            });
    }, [signatureId]);

    if (error) {
        return <View><Text>{error}</Text></View>;
    }

    if (!signatures) {
        return <View><Text>Loading...</Text></View>;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Signature 1</Text>
            <Image
                source={{ uri: `data:image/png;base64,${signatures.signature1Base64}` }}
                style={styles.signatureImage}
            />
            <Text style={styles.title}>Signature 2</Text>
            <Image
                source={{ uri: `data:image/png;base64,${signatures.signature2Base64}` }}
                style={styles.signatureImage}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    signatureImage: {
        width: 200,
        height: 200,
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 30,
    },
});

export default SignatureViewer;
