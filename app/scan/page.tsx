'use client';

import { useEffect, useState } from 'react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { useUmbraStore } from '../store/umbraStore';
import toast from 'react-hot-toast';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { useRouter } from 'next/navigation';

function isValidBase58(value: string): boolean {
    try {
        bs58.decode(value);
        return true;
    } catch (error) {
        return false;
    }
}

export default function Page() {
    const [error, setError] = useState<Error | null>(null);
    const router = useRouter();
    const setLastScannedAddress = useUmbraStore((state) => state.setLastScannedAddress);
    const result = useUmbraStore((state) => state.lastScannedAddress);

    useEffect(() => {
        setLastScannedAddress('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleScan = (detectedCodes: IDetectedBarcode[]) => {
        if (detectedCodes && detectedCodes.length > 0) {
            if (isValidBase58(detectedCodes[0].rawValue)) {
                setLastScannedAddress(detectedCodes[0].rawValue);
                router.back();
            } else {
                toast.error('Invalid QR code format. Please scan a valid Base58 address.');
            }
        }
    };

    const handleError = (err: Error) => {
        setError(err);
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">QR Code Scanner</h1>

            <div className="mb-4">
                <Scanner
                    onScan={handleScan}
                    scanDelay={500}
                    constraints={{
                        facingMode: 'environment',
                    }}
                />
            </div>

            {error && <div className="text-red-500 mb-4">Error: {error.message}</div>}

            {result && (
                <div className="p-4 bg-gray-100 rounded">
                    <h2 className="font-bold mb-2">Scan Result:</h2>
                    <p>{result}</p>
                </div>
            )}
        </div>
    );
}
