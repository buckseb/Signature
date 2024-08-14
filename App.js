import React, { useRef, useState } from 'react';
import { View, StyleSheet, Button, Alert, ScrollView, Image, Text } from 'react-native';
import { SignaturePad } from './SignaturePad';

const App = () => {
  const signaturePad1Ref = useRef(null);
  const signaturePad2Ref = useRef(null);
  const [signature1Base64, setSignature1Base64] = useState(null);
  const [signature2Base64, setSignature2Base64] = useState(null);

  const handleSave = async () => {
    try {
      const base64Signature1 = await signaturePad1Ref.current.saveSignature();
      const base64Signature2 = await signaturePad2Ref.current.saveSignature();

      if (!base64Signature1 || !base64Signature2) {
        Alert.alert('Error', 'Both signatures are required');
        return;
      }

      const response = await fetch('http://192.168.119.1:8080/signatures/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature1: base64Signature1,
          signature2: base64Signature2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${errorText}`);
      }

      const data = await response.json();
      Alert.alert('Success', data.message || 'Signatures saved successfully');
    } catch (error) {
      console.error('Failed to save signatures:', error.message);
      Alert.alert('Error', error.message || 'Failed to save signatures');
    }
  };

  const handleViewSignatures = async () => {
    try {
      const signatureId = 19; // Replace with the actual signature ID you want to view
      const response = await fetch(`http://192.168.119.1:8080/signatures/view/${signatureId}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${errorText}`);
      }

      const data = await response.json();
      if (data.message === 'Signatures retrieved successfully') {
        setSignature1Base64(data.signature1Base64);
        setSignature2Base64(data.signature2Base64);
      } else {
        Alert.alert('Error', data.message || 'Failed to retrieve signatures');
      }
    } catch (error) {
      console.error('Failed to retrieve signatures:', error.message);
      Alert.alert('Error', error.message || 'Failed to retrieve signatures');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SignaturePad ref={signaturePad1Ref} />
      <SignaturePad ref={signaturePad2Ref} />
      <Button title="Save Signatures" onPress={handleSave} />
      <Button title="View Signatures" onPress={handleViewSignatures} />

      {signature1Base64 && (
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureTitle}>Signature 1:</Text>
          <Image
            source={{ uri: `data:image/png;base64,${signature1Base64}` }}
            style={styles.signatureImage}
          />
        </View>
      )}

      {signature2Base64 && (
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureTitle}>Signature 2:</Text>
          <Image
            source={{ uri: `data:image/png;base64,${signature2Base64}` }}
            style={styles.signatureImage}
          />
        </View>
      )}
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
  signatureContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  signatureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  signatureImage: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: '#000',
  },
});

export default App;
