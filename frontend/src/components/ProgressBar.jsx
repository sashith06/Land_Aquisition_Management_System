const ProgressBar = ({ plans }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Progress</h2>
      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              {/* Project Image */}
              <img
                src={plan.image}
                alt={`Project ${plan.id}`}
                className="w-16 h-16 rounded-lg object-cover"
              />
              
              {/* Plan ID */}
              <div className="w-16">
                <span className="font-bold text-lg text-gray-800">{plan.id}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${plan.progress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Percentage */}
              <div className="w-20 text-right">
                <span className="font-semibold text-gray-600">{plan.progress}% Done</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;