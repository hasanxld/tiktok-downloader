// components/HowItWorks.jsx
const steps = [
  {
    step: "01",
    title: "COPY TIKTOK URL",
    description: "COPY THE TIKTOK VIDEO URL FROM THE TIKTOK APP OR WEBSITE"
  },
  {
    step: "02",
    title: "PASTE URL",
    description: "PASTE THE COPIED URL INTO THE INPUT FIELD ABOVE"
  },
  {
    step: "03",
    title: "CLICK DOWNLOAD",
    description: "CLICK THE DOWNLOAD BUTTON TO PROCESS THE VIDEO"
  },
  {
    step: "04",
    title: "SAVE VIDEO",
    description: "DOWNLOAD YOUR TIKTOK VIDEO WITHOUT WATERMARK"
  }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold gradient-text mb-4">HOW IT WORKS</h2>
        <p className="text-gray-600">4 SIMPLE STEPS TO DOWNLOAD TIKTOK VIDEOS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item, index) => (
          <div key={index} className="relative border border-gray-200 p-6 text-center">
            <div className="bg-primary-gradient w-12 h-12 flex items-center justify-center text-white font-bold text-lg mb-4 mx-auto">
              {item.step}
            </div>
            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.description}</p>
            
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                <div className="bg-primary-gradient w-6 h-1"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
