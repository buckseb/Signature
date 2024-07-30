import React, { useRef } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import { SignaturePad } from './SignaturePad';

const App = () => {
  const signaturePad1Ref = useRef(null);
  const signaturePad2Ref = useRef(null);

  const handleSave = async () => {
    try {
      const base64Signature1 = await signaturePad1Ref.current.saveSignature();
      const base64Signature2 = await signaturePad2Ref.current.saveSignature();

      if (!base64Signature1 || !base64Signature2) {
        Alert.alert('Error', 'Both signatures are required');
        return;
      }

      console.log('Signature 1:', base64Signature1);
      console.log('Signature 2:', base64Signature2);

      const response = await fetch('http://192.168.119.1:3000/save-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature1: base64Signature1,
          signature2: base64Signature2,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Signatures saved successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to save signatures');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save signatures');
    }
  };

  return (
    <View style={styles.container}>
      <SignaturePad ref={signaturePad1Ref} />
      <SignaturePad ref={signaturePad2Ref} />
      <Button title="Save Signatures" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
