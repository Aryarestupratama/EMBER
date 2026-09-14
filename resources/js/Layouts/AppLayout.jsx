import { Head } from '@inertiajs/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AppLayout({
    title,
    active = null,
    showCtaButton = false,
    transparentNav = false,
    showFooter = false,
    footerDark = false,
    mainClassName = 'mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8',
    children,
}) {
    const resolvedMainClassName =
        mainClassName && !transparentNav ? `pt-20 sm:pt-24 ${mainClassName}` : mainClassName;

    return (
        <>
            <Head title={title} />

            <div className="min-h-screen bg-canvas">
                <Navbar
                    active={active}
                    showCtaButton={showCtaButton}
                    variant={transparentNav ? 'transparent' : 'solid'}
                />

                {resolvedMainClassName ? (
                    <main className={resolvedMainClassName}>{children}</main>
                ) : (
                    children
                )}

                {showFooter && <Footer dark={footerDark} />}
            </div>
        </>
    );
}