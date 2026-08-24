import "./LearnMore.css";

import {
    LearnHero,
    LearnAbout,
    LearnFeatures,
    LearningJourney,
    TechStack,
    WhyTechMonster,
    LearnCTA,
} from "./components";

import BackButton from "../../../components/ui/Button/BackButton";


const LearnMore = () => {

    return (

        <main className="learn-page">
            <BackButton
                to="/"
                label="Back to Landing Page"
                className="learn-back-button"
            />

            <LearnHero />

            <LearnAbout />

            <LearnFeatures />

            <LearningJourney />

            <TechStack />

            <WhyTechMonster />

            <LearnCTA />

        </main>

    );
};
export default LearnMore;