import UploadForm from '@/components/UploadForm';

export default function UploadPage() {
    return (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-serif font-bold text-brand-black sm:text-4xl tracking-tight">
                    Upload a Flyer
                </h1>
                <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
                    Snap a photo of any free food flyer you see on campus. We'll extract the details automatically.
                </p>
            </div>
            <UploadForm />
        </main>
    );
}
