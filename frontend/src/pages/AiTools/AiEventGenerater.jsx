import { useState } from "react";
import EventForm from "../../components/AiTools/EventForm";
import OutputDisplay from "../../components/AiTools/OutputForm";
import withSidebarToggle from '../../hocs/withSidebarToggle';
import Navbar from '../../components/Navbar';

const AiEventGenerater = ({ onSidebarToggle }) => {
  const [output, setOutput] = useState("");
  return(
    <>
            <Navbar onSidebarToggle={onSidebarToggle} />
            <main className="min-h-screen overflow-y-auto pt-[60px] px-10 py-5 bg-[#111019] text-white">
              <div className="min-h-screen bg-[#18181B]-100 p-8">
                <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8">
                  🎉 AI Event Planner
                </h1>
                <div className="max-w-4xl mx-auto">
                  <EventForm setOutput={setOutput} />
                  <OutputDisplay output={output} />
                </div>
              </div>
              </main>
    </>
  );
}

export default AiEventGenerater;