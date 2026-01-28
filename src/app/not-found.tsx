"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Card = () => {
    const router = useRouter();
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen w-full bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-6"
        >
            <Button 
                variant="outline"
                onClick={() => {
                    router.push("/")
                }}
                className="bg-black flex justify-top" // TODO: have some padding
            >Back</Button>
            <div className="relative flex items-center h-screen justify-center">
                <div className="flex items-center justify-center w-[30em] h-[30em]">
                    <div className="flex flex-col items-center mt-[5em]">
            
                        {/* Antenna */}
                        <div className="relative w-[5em] h-[5em] rounded-full border-2 border-black bg-[#f27405] -mb-[6em]" />
            
                        {/* TV */}
                        <div className="relative flex justify-center w-[17em] h-[9em] mt-[3em] rounded-[15px] bg-[#d36604] border-2 border-[#1d0e01] shadow-[inset_0.2em_0.2em_#e69635]">
            
                        {/* Screen */}
                        <div className="flex items-center justify-center rounded-[15px] shadow-[3.5px_3.5px_0_#e69635]">
                            <div className="flex items-center justify-center w-[11em] h-[7.75em] rounded-[10px]">
                            <div className="relative flex items-center justify-center w-[13em] h-[7.85em] rounded-[10px] border-2 border-black font-bold tracking-[0.15em] overflow-hidden
                                bg-[linear-gradient(to_right,#002fc6_0%,#002bb2_14%,#3a3a3a_14%,#303030_28%,#ff0afe_28%,#f500f4_42%,#6c6c6c_42%,#626262_57%,#0affd9_57%,#00f5ce_71%,#3a3a3a_71%,#303030_85%,white_85%,#fafafa_100%)]">
                                <span className="z-10 px-2 py-1 text-xs text-white bg-black rounded">
                                NOT FOUND
                                </span>
                            </div>
                            </div>
                        </div>
            
                        {/* Lines */}
                        <div className="absolute bottom-2 right-2 flex gap-[2px]">
                            <div className="w-[2px] h-[0.5em] bg-black rounded-t-full" />
                            <div className="w-[2px] h-[1em] bg-black rounded-t-full" />
                            <div className="w-[2px] h-[0.5em] bg-black rounded-t-full" />
                        </div>
            
                        {/* Buttons */}
                        <div className="absolute right-[-4.5em] top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 w-[4.25em] h-[8em] p-2 bg-[#e69635] border-2 border-[#1d0e01] rounded-[10px] shadow-[3px_3px_0_#e69635]">
            
                            <div className="w-[1.65em] h-[1.65em] rounded-full bg-[#7f5934] border-2 border-black" />
                            <div className="w-[1.65em] h-[1.65em] rounded-full bg-[#7f5934] border-2 border-black" />
            
                            {/* Speakers */}
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-1">
                                    <div className="w-[0.65em] h-[0.65em] rounded-full bg-[#7f5934] border-2 border-black" />
                                    <div className="w-[0.65em] h-[0.65em] rounded-full bg-[#7f5934] border-2 border-black" />
                                    <div className="w-[0.65em] h-[0.65em] rounded-full bg-[#7f5934] border-2 border-black" />
                                </div>
                                <div className="h-[2px] bg-[#171717]" />
                                <div className="h-[2px] bg-[#171717]" />
                            </div>
                        </div>
                    </div>
            
                    {/* Base */}
                    <div className="relative flex justify-center gap-[8.7em] mt-1">
                        <div className="w-[2em] h-[1em] bg-[#4d4d4d] border-2 border-[#171717]" />
                        <div className="w-[2em] h-[1em] bg-[#4d4d4d] border-2 border-[#171717]" />
                        <div className="absolute top-[0.8em] w-[17.5em] h-[0.15em] bg-[#171717]" />
                    </div>
                </div>
            
                    {/* 404 Background Text */}
                    <div className="absolute flex gap-[6em] opacity-50 -z-10 font-montserrat">
                        <div className="scale-x-[9] scale-y-[24.5]">4</div>
                        <div className="scale-x-[9] scale-y-[24.5]">0</div>
                        <div className="scale-x-[9] scale-y-[24.5]">4</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
  
export default Card;
  