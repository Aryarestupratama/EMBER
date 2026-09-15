import AppLayout from '@/Layouts/AppLayout';
import RiskBadge from '@/components/RiskBadge';
import SourceCredit from '@/components/SourceCredit';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
    Satellite,
    TreeDeciduous,
    Wind,
    MapPinned,
    ScaleIcon,
    TriangleAlert,
    ShieldCheck,
    LifeBuoy,
    Users,
    GraduationCap,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
});

// Urutan & ikon sumber data tetap; nama/peran/deskripsi diambil dari
// kamus terjemahan (about.dataSourcesList.*) supaya konsisten ID/EN.
const DATA_SOURCE_KEYS = [
    { key: 'firms', icon: Satellite },
    { key: 'gfw', icon: TreeDeciduous },
    { key: 'iqair', icon: Wind },
    { key: 'gadm', icon: MapPinned },
    { key: 'bnpb', icon: LifeBuoy },
];

// Data tim & threshold bersifat faktual (bukan teks UI), tidak diterjemahkan.
const SUPERVISOR = {
    name: 'Siti Maesaroh, S.Kom., M.T.I.',
    affiliation: 'Universitas Mercu Buana',
};

const TEAM_MEMBERS = [
    { name: 'Arya Restu Pratama', role: '[Peran]' },
    { name: 'Justin Dwinata', role: '[Peran]' },
    { name: 'Mutia Bela Puspita', role: '[Peran]' },
    { name: 'Azka Niaji Rangkuti', role: '[Peran]' },
];

const THRESHOLDS = [
    { category: 'rendah', range: '0% – 13%', score: '0 – 0.37' },
    { category: 'sedang', range: '13% – 18%', score: '0.37 – 0.51' },
    { category: 'tinggi', range: '18% – 23%', score: '0.51 – 0.66' },
    { category: 'sangat_tinggi', range: '23% – 35%+', score: '0.66 – 1.0' },
];

function SectionHeading({ icon: Icon, iconClass, bgClass, children }) {
    return (
        <h2 className="mb-4 flex items-center gap-2.5 font-heading text-base font-semibold text-ink sm:text-lg">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bgClass}`}>
                <Icon className={`h-4 w-4 ${iconClass}`} strokeWidth={2.2} />
            </span>
            {children}
        </h2>
    );
}

export default function About() {
    const { t } = useLanguage();

    const limitationItems = [
        <>
            {t('about.sections.limitations.item1Prefix')}
            <strong className="text-ink">{t('about.sections.limitations.item1Bold')}</strong>
            {t('about.sections.limitations.item1Suffix')}
        </>,
        <>{t('about.sections.limitations.item2')}</>,
        <>{t('about.sections.limitations.item3')}</>,
        <>{t('about.sections.limitations.item4')}</>,
        <>{t('about.sections.limitations.item5')}</>,
        <>{t('about.sections.limitations.item6')}</>,
    ];

    return (
        <AppLayout
            title={t('about.pageTitle')}
            active="about"
            mainClassName="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10"
        >
            <motion.div
                variants={staggerContainer(0.12)}
                initial="hidden"
                animate="visible"
                className="relative"
            >
                <div className="pointer-events-none absolute -top-10 right-0 -z-10 h-72 w-72 rounded-full bg-forest-dark/[0.04] blur-3xl" />
                <div className="pointer-events-none absolute top-96 -left-16 -z-10 h-64 w-64 rounded-full bg-fresh/[0.05] blur-3xl" />

                <motion.div variants={fadeUp} className="mb-10">
                    <h1 className="font-heading text-xl font-bold text-ink sm:text-2xl">{t('about.title')}</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
                        {t('about.intro')}
                    </p>
                </motion.div>

                <motion.section variants={fadeUp} className="mb-10">
                    <SectionHeading icon={Satellite} iconClass="text-forest-dark" bgClass="bg-forest/10">
                        {t('about.sections.dataSources.heading')}
                    </SectionHeading>
                    <motion.div
                        variants={staggerContainer(0.08)}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    >
                        {DATA_SOURCE_KEYS.map((source) => (
                            <motion.div key={source.key} variants={fadeUp}>
                                <Card className="h-full border-black/5 shadow-sm transition-shadow hover:shadow-md">
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="mb-3 flex items-center gap-2.5">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-forest-dark">
                                                <source.icon className="h-4 w-4" />
                                            </span>
                                            <div>
                                                <p className="font-heading text-sm font-semibold text-ink">
                                                    {t(`about.dataSourcesList.${source.key}.name`)}
                                                </p>
                                                <p className="text-xs text-ink/50">
                                                    {t(`about.dataSourcesList.${source.key}.role`)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm leading-relaxed text-ink/70">
                                            {t(`about.dataSourcesList.${source.key}.description`)}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>

                <motion.section variants={fadeUp} className="mb-10">
                    <SectionHeading icon={ScaleIcon} iconClass="text-forest-dark" bgClass="bg-forest/10">
                        {t('about.sections.calculation.heading')}
                    </SectionHeading>

                    <Card className="mb-4 border-black/5 shadow-sm">
                        <CardContent className="space-y-3 p-4 text-sm leading-relaxed text-ink/70 sm:p-5">
                            <p>
                                {t('about.sections.calculation.p1Prefix')}
                                <strong className="text-ink">{t('about.sections.calculation.p1Bold')}</strong>
                                {t('about.sections.calculation.p1Suffix')}
                            </p>
                            <p className="overflow-x-auto rounded-lg bg-canvas px-4 py-3 font-mono text-xs text-ink/80">
                                {t('about.sections.calculation.formula')}
                            </p>
                            <p>
                                {t('about.sections.calculation.p2Prefix')}
                                <strong className="text-ink">{t('about.sections.calculation.p2Bold')}</strong>
                                {t('about.sections.calculation.p2Suffix')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-black/5 shadow-sm">
                        <CardContent className="p-4 sm:p-5">
                            <p className="mb-3 text-xs font-medium text-ink/50">
                                {t('about.sections.calculation.thresholdsCaption')}
                            </p>
                            <div className="overflow-x-auto rounded-lg border border-black/5">
                                <table className="w-full min-w-[420px] text-sm">
                                    <thead className="bg-canvas/70 text-left text-xs uppercase tracking-wide text-ink/40">
                                        <tr>
                                            <th className="px-4 py-2.5">{t('about.thresholds.category')}</th>
                                            <th className="px-4 py-2.5">{t('about.thresholds.treeCoverLoss')}</th>
                                            <th className="px-4 py-2.5">{t('about.thresholds.score')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5">
                                        {THRESHOLDS.map((row) => (
                                            <tr key={row.category}>
                                                <td className="px-4 py-2.5">
                                                    <RiskBadge category={row.category} />
                                                </td>
                                                <td className="tabular-nums px-4 py-2.5 text-ink/70">
                                                    {row.range}
                                                </td>
                                                <td className="tabular-nums px-4 py-2.5 text-ink/70">
                                                    {row.score}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-ink/50">
                                <RiskBadge category="na" className="mr-1 align-middle" />
                                {t('about.sections.calculation.naNote')}
                            </p>
                        </CardContent>
                    </Card>
                </motion.section>

                <motion.section variants={fadeUp} className="mb-10">
                    <SectionHeading icon={ScaleIcon} iconClass="text-fresh" bgClass="bg-fresh/10">
                        {t('about.sections.priorityScore.heading')}
                    </SectionHeading>
                    <Card className="border-black/5 shadow-sm">
                        <CardContent className="space-y-3 p-4 text-sm leading-relaxed text-ink/70 sm:p-5">
                            <p>{t('about.sections.priorityScore.p1')}</p>
                            <p className="overflow-x-auto rounded-lg bg-canvas px-4 py-3 font-mono text-xs text-ink/80">
                                {t('about.sections.priorityScore.formula')}
                            </p>
                            <p>{t('about.sections.priorityScore.p2')}</p>
                        </CardContent>
                    </Card>
                </motion.section>

                <motion.section variants={fadeUp} className="mb-10">
                    <SectionHeading
                        icon={TriangleAlert}
                        iconClass="text-risk-tinggi"
                        bgClass="bg-risk-tinggi/10"
                    >
                        {t('about.sections.limitations.heading')}
                    </SectionHeading>
                    <Card className="border-black/5 shadow-sm">
                        <CardContent className="p-4 sm:p-5">
                            <motion.ul
                                variants={staggerContainer(0.06)}
                                className="space-y-2.5 text-sm leading-relaxed text-ink/70"
                            >
                                {limitationItems.map((point, i) => (
                                    <motion.li
                                        key={i}
                                        variants={fadeUp}
                                        className="flex items-start gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-canvas"
                                    >
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                                        <span>{point}</span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </CardContent>
                    </Card>
                </motion.section>

                <motion.section variants={fadeUp} className="mb-10">
                    <SectionHeading icon={ShieldCheck} iconClass="text-forest-dark" bgClass="bg-forest/10">
                        {t('about.sections.neutrality.heading')}
                    </SectionHeading>
                    <Card className="border-black/5 bg-forest-dark/[0.03] shadow-sm">
                        <CardContent className="p-4 text-sm leading-relaxed text-ink/70 sm:p-5">
                            <p>{t('about.sections.neutrality.text')}</p>
                        </CardContent>
                    </Card>
                </motion.section>

                <motion.section variants={fadeUp} className="mb-10">
                    <SectionHeading icon={Users} iconClass="text-forest-dark" bgClass="bg-forest/10">
                        {t('about.sections.team.heading')}
                    </SectionHeading>
                    <Card className="border-black/5 shadow-sm">
                        <CardContent className="p-4 sm:p-5">
                            <p className="mb-5 text-sm leading-relaxed text-ink/70">
                                {t('about.sections.team.intro')}
                            </p>

                            <div className="mb-5 flex items-center gap-3 rounded-lg bg-canvas px-4 py-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-dark/10 text-forest-dark">
                                    <GraduationCap className="h-4.5 w-4.5" />
                                </span>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                                        {t('about.sections.team.supervisorTitle')}
                                    </p>
                                    <p className="font-heading text-sm font-semibold text-ink">
                                        {SUPERVISOR.name}
                                    </p>
                                    <p className="text-xs text-ink/50">{SUPERVISOR.affiliation}</p>
                                </div>
                            </div>

                            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/40">
                                {t('about.sections.team.membersLabel')}
                            </p>
                            <motion.div
                                variants={staggerContainer(0.08)}
                                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                            >
                                {TEAM_MEMBERS.map((member) => (
                                    <motion.div
                                        key={member.name}
                                        variants={fadeUp}
                                        className="flex items-center gap-3 rounded-lg border border-black/5 px-4 py-3 transition-colors hover:bg-canvas"
                                    >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fresh/10 text-fresh">
                                            <Users className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-ink">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-ink/50">{member.role}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.section>

                <motion.div variants={fadeUp}>
                    <SourceCredit />
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}