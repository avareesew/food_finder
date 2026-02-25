import UploadForm from '@/components/UploadForm';

export default function UploadPage() {
    return (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-serif font-bold text-brand-black sm:text-4xl tracking-tight dark:text-gray-50">
                    Upload a Flyer
                </h1>
                <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto dark:text-gray-300">
                    Snap a photo of any free food flyer you see on campus. We&apos;ll extract the details automatically.
                </p>
            </div>
            <UploadForm />
        </main>
    );
}
