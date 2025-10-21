import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Logger } from '../utils/logger';
import Colors from '../styles/colors';

const { width, height } = Dimensions.get('window');

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onBarcodeScanned: (barcode: string) => void;
}

/**
 * Barcode Scanner Component
 * Allows users to scan product barcodes
 */
const BarcodeScannerComponent: React.FC<BarcodeScannerProps> = ({
  visible,
  onClose,
  onBarcodeScanned,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastScannedData, setLastScannedData] = useState<string>('');
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  /**
   * Request camera permission on mount
   */
  useEffect(() => {
    if (visible && !permission) {
      requestPermission();
    }
  }, [visible]);

  /**
   * Animate scan line
   */
  useEffect(() => {
    if (visible && permission?.granted && !scanned) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [visible, permission, scanned]);

  /**
   * Handle barcode scan
   */
  const handleBarCodeScanned = (result: any) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📷 BARCODE SCANNER - SCAN DETECTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📸 Scan Result:', result);
    console.log('  Type:', typeof result);
    console.log('  Keys:', Object.keys(result || {}));
    
    if (scanned) {
      console.log('⚠️ Already scanned, ignoring');
      return;
    }
    
    // expo-camera returns { type, data } or { cornerPoints, data, type, bounds }
    const barcodeData = result?.data || result;
    const barcodeType = result?.type || 'unknown';
    
    console.log('🔍 Extracted Data:');
    console.log('  Data:', barcodeData);
    console.log('  Type:', barcodeType);
    
    // Filter out QR codes and URLs (we only want product barcodes)
    if (barcodeType === 'qr' || String(barcodeData).startsWith('http')) {
      console.log('⚠️ QR code or URL detected, ignoring:', barcodeData);
      return;
    }
    
    if (!barcodeData) {
      console.log('❌ No barcode data found');
      Logger.warn('BarcodeScanner', 'Invalid barcode data', result);
      return;
    }
    
    setScanned(true);
    setLastScannedData(barcodeData);
    
    Logger.log('BarcodeScanner', 'Barcode scanned successfully', { 
      type: barcodeType, 
      data: barcodeData,
      fullResult: result 
    });
    
    // Show success feedback
    console.log(`✅ Barkod Okundu: ${barcodeData}`);
    console.log(`📞 Calling parent callback with: ${barcodeData}`);
    
    onBarcodeScanned(barcodeData);
    
    console.log('⏱️ Setting 2 second cooldown...');
    
    // Reset after 2 seconds (allow re-scanning)
    setTimeout(() => {
      console.log('🔄 Resetting scanner state');
      setScanned(false);
      setLastScannedData('');
    }, 2000);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  };

  /**
   * Handle close
   */
  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>Kamera izni isteniyor...</Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionEmoji}>📷</Text>
            <Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
            <Text style={styles.permissionText}>
              Barkod okutmak için kamera iznine ihtiyacımız var.
            </Text>
            <View style={styles.permissionButtons}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleClose}
              >
                <Text style={styles.closeButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.permissionButton} 
                onPress={requestPermission}
              >
                <Text style={styles.permissionButtonText}>İzin Ver</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📷 Barkod Okut</Text>
          <TouchableOpacity onPress={handleClose} style={styles.headerCloseButton}>
            <Text style={styles.headerCloseText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Camera View */}
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: [
                'aztec',
                'ean13',
                'ean8',
                'qr',
                'pdf417',
                'upc_e',
                'datamatrix',
                'code39',
                'code93',
                'itf14',
                'codabar',
                'code128',
                'upc_a',
              ],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />

          {/* Scanner Frame */}
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
              
              {/* Animated Scan Line */}
              {!scanned && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [
                        {
                          translateY: scanLineAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, width * 0.6],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              )}
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>
            {scanned ? '✓ Barkod Okundu!' : 'Barkodu Çerçeve İçine Hizalayın'}
          </Text>
          <Text style={styles.instructionText}>
            {scanned
              ? `Barkod: ${lastScannedData}\nÜrün bilgileri yükleniyor...`
              : 'Ürün üzerindeki barkodu okutun'}
          </Text>
          {!scanned && (
            <Text style={styles.debugText}>
              📱 Kamera aktif - Barkod bekleniyor
            </Text>
          )}
        </View>

        {/* Rescan Button */}
        {scanned && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.rescanButtonText}>🔄 Tekrar Okut</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCloseText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scannerFrame: {
    width: width * 0.8,
    height: width * 0.6,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.primary.main,
    borderWidth: 5,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary.main,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
    opacity: 0.9,
  },
  instructions: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 24,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  debugText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.main,
    marginTop: 12,
    textAlign: 'center',
  },
  rescanButton: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  rescanButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.background.secondary,
  },
  permissionEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  permissionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  closeButton: {
    flex: 1,
    backgroundColor: Colors.neutral[300],
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  permissionButton: {
    flex: 1,
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default BarcodeScannerComponent;

