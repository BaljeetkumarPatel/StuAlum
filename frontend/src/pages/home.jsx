// frontend/src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import withSidebarToggle from '../hocs/withSidebarToggle'; 
import Navbar from '../components/Navbar'; 
import HeroSection from '../components/homepage/HeroSection';
import ImpactNumbers from '../components/homepage/ImpactNumbers';
import QuickActions from '../components/homepage/QuickActions';
import AIRecommendations from '../components/homepage/AIRecommendations';
import AlumniNetwork from '../components/homepage/AlumniNetwork';
import UpcomingEvents from '../components/homepage/UpcomingEvents';
import DiscoverFeatures from '../components/homepage/Features';
import AIPowersJourney from '../components/homepage/AIPowers';
import CommunitySays from '../components/homepage/CommunitySays';
import Footer from '../components/Footer';
import SimpleChatbot from '../components/chatbot/SimpleChatbot'
import { getCurrentUserIdFromToken } from "../utils/authUtils";

const Home = ({ onSidebarToggle }) => { 

    const [userId, setUserId] = useState(null);
    useEffect(() => {
    const id = getCurrentUserIdFromToken();
    setUserId(id);
}, []);


    return (
        // Renders content and navbar as siblings inside the HOC's wrapper
        <>
            {/* 1. RENDER THE FIXED NAVBAR */}
            <Navbar onSidebarToggle={onSidebarToggle} /> 

            {/* 2. Main content area (This must be a scrolling element below the fixed Navbar) */}
            {/* pt-[60px] is the final required fix to ensure visibility */}
            <main className="min-h-screen overflow-y-auto pt-[60px] px-10 py-5 bg-[#111019] text-white"> 
                
                {/* Content components */}
                <HeroSection />
                <ImpactNumbers />
                <QuickActions />
                <AIRecommendations />
                <AlumniNetwork />
                <UpcomingEvents />
                <DiscoverFeatures />
                <AIPowersJourney />
                <CommunitySays />
                
                <Footer />
            </main>
           {userId &&
                userId !== "null" &&
                userId !== "undefined" &&
                userId !== "" &&
                userId !== " " &&
                typeof userId === "string" &&
                userId.length > 5 ? (
                <SimpleChatbot />
                ) : null}
        </>
    );
};

export default withSidebarToggle(Home);