import { Link } from "react-router-dom";
import { useState } from "react";
import { readSiteSettings } from "../utils/siteSettings";

const About = () => {
  const [settings] = useState(readSiteSettings);
  const statistics = [
    {
      number: "2",
      suffix: "+",
      label: "Tahun pengalaman",
    },
    {
      number: "5",
      suffix: "+",
      label: "Program belajar",
    },
    {
      number: "1",
      suffix: "k",
      label: "Siswa di seluruh dunia",
    },
    {
      number: "90",
      suffix: "%",
      label: "Kepuasan siswa",
    },
  ];

  return (
    <section className="bg-[#f7f8fa] py-10 sm:py-14 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-8 lg:px-10">

        {/* =========================
            STATISTICS
        ========================== */}
        <div
          className="
            grid grid-cols-4
            gap-2
            sm:gap-6
            md:gap-10
            lg:gap-16
            text-center
            mb-16
            sm:mb-20
            md:mb-20
            lg:mb-20
          "
        >
          {statistics.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Number */}
              <h2
                className="
                  whitespace-nowrap
                  text-[22px]
                  leading-none
                  font-bold
                  text-black
                  sm:text-4xl
                  md:text-5xl
                  lg:text-6xl
                "
              >
                {item.number}
                <span className="text-green-500">
                  {item.suffix}
                </span>
              </h2>

              {/* Label */}
              <p
                className="
                  mt-4
                  max-w-[75px]
                  text-[10px]
                  leading-5
                  text-gray-500
                  sm:mt-4
                  sm:max-w-none
                  sm:text-sm
                  sm:leading-6
                  md:text-base
                  lg:text-lg
                "
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* =========================
            ABOUT CONTENT
        ========================== */}
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            items-center
            gap-10
            sm:gap-12
            md:gap-14
            lg:gap-16
          "
        >

          {/* =========================
              IMAGE
          ========================== */}
          <div
            className="
              order-1
              lg:order-2
              w-full
            "
          >
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
              alt="About Us"
              className="
                block
                w-full
                h-30
                object-cover
                rounded-2xl
                sm:h-50
                sm:rounded-3xl
                md:h-60
                lg:h-60
                xl:h-60
              "
            />
          </div>

          {/* =========================
              TEXT CONTENT
          ========================== */}
          <div
            className="
              order-2
              lg:order-1
              w-full
              text-center
              lg:text-left
            "
          >
            {/* Label */}
            <p
              className="
                text-sm
                font-medium
                text-gray-500
                sm:text-base
                md:text-lg
              "
            >
              About us
            </p>

            {/* Heading */}
            <h2
              className="
                mt-3
                text-[20px]
                leading-[1.25]
                font-bold
                tracking-tight
                text-[#1f2937]
                sm:mt-4
                sm:text-3xl
                md:text-4xl
                lg:text-4xl
                xl:text-4xl
              "
            >
              Platform E-Learning untuk
              <br className="hidden sm:block" />
              Keterampilan Digital
            </h2>

            {/* Description */}
            <p
              className="
                mx-auto
                mt-4
                max-w-[310px]
                text-[13px]
                leading-5
                text-gray-500
                sm:mt-5
                sm:max-w-[550px]
                sm:text-sm
                sm:leading-6
                md:text-base
                md:leading-7
                lg:mx-0
                lg:max-w-[560px]
                lg:text-base
              "
            >
              {settings.aboutText}
            </p>

            {/* Button */}
            <div
              className="
                mt-6
                flex
                justify-center
                lg:justify-start
                sm:mt-7
                md:mt-8
              "
            >
              <Link
                to="/about"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-green-500
                  px-7
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  duration-300
                  hover:bg-green-600
                  hover:shadow-md
                  focus:outline-none
                  focus:ring-2
                  focus:ring-green-500
                  focus:ring-offset-2
                  sm:px-8
                  sm:py-3.5
                  sm:text-base
                  md:px-9
                  md:py-4
                "
              >
                Pelajari lebih lanjut
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;