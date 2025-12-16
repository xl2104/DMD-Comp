import React, { useState } from 'react';
import { UserProfile, Region, InterestArea } from '../types';
import { Save, CheckCircle } from 'lucide-react';

interface Props {
  initialData?: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  isInitialSetup?: boolean;
}

export const ProfileForm: React.FC<Props> = ({ initialData, onSave, isInitialSetup = false }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>(initialData || {
    interests: []
  });

  const handleInterestToggle = (interest: InterestArea) => {
    const current = formData.interests || [];
    if (current.includes(interest)) {
      setFormData({ ...formData, interests: current.filter(i => i !== interest) });
    } else {
      setFormData({ ...formData, interests: [...current, interest] });
    }
  };

  const handleSubmit = () => {
    if (formData.ageGroup && formData.ambulatoryStatus && formData.region) {
        onSave({
            isConfigured: true,
            ageGroup: formData.ageGroup,
            geneticProfile: formData.geneticProfile || "未填写",
            ambulatoryStatus: formData.ambulatoryStatus,
            onSteroids: formData.onSteroids || "unsure",
            region: formData.region,
            interests: formData.interests || [],
            clinicalNotes: formData.clinicalNotes || ""
        } as UserProfile);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${isInitialSetup ? 'p-8 shadow-xl' : 'p-6'}`}>
        {isInitialSetup && (
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">欢迎来到 罕知-DMD Companion</h1>
                <p className="text-gray-500 mt-2">请完善您的个性化信息，以便我们为您推送最相关的研究。</p>
            </div>
        )}

        <div className="space-y-6">
            {/* Section 1 */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs mr-2">1</span>
                    基本信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">患者年龄组</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['child', 'adult'].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => setFormData({...formData, ageGroup: val as any})}
                                    className={`py-2 px-3 rounded text-sm transition-colors ${
                                        formData.ageGroup === val 
                                        ? 'bg-brand-600 text-white shadow-md' 
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {val === 'child' ? '儿童 (Child)' : '成人 (Adult)'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">所在地区 (用于临床试验匹配)</label>
                        <select 
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white"
                            value={formData.region || ''}
                            onChange={(e) => setFormData({...formData, region: e.target.value as Region})}
                        >
                            <option value="" disabled>请选择地区</option>
                            {Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 2 */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                 <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs mr-2">2</span>
                    临床概况
                </h3>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">基因突变类型 (选填)</label>
                        <input 
                            type="text" 
                            placeholder="例如: Exon 51 Deletion, Point Mutation..." 
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                            value={formData.geneticProfile || ''}
                            onChange={e => setFormData({...formData, geneticProfile: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">当前行动能力</label>
                             <div className="flex flex-col gap-2">
                                {['ambulatory', 'wheelchair', 'mixed'].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setFormData({...formData, ambulatoryStatus: val as any})}
                                        className={`py-2 px-3 rounded text-xs text-left transition-colors ${
                                            formData.ambulatoryStatus === val 
                                            ? 'bg-brand-600 text-white shadow-md' 
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {val === 'ambulatory' ? '可独立行走' : val === 'wheelchair' ? '需轮椅辅助' : '混合/辅助行走'}
                                    </button>
                                ))}
                             </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">激素类药物使用?</label>
                             <div className="flex flex-col gap-2">
                                {['yes', 'no', 'unsure'].map((val) => (
                                    <label key={val} className="flex items-center p-2 border rounded bg-white hover:bg-gray-50 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="steroids"
                                            checked={formData.onSteroids === val}
                                            onChange={() => setFormData({...formData, onSteroids: val as any})}
                                            className="text-brand-600 focus:ring-brand-500 h-4 w-4 mr-2"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {val === 'yes' ? '是 (Yes)' : val === 'no' ? '否 (No)' : '不确定 (Unsure)'}
                                        </span>
                                    </label>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3 */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                 <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs mr-2">3</span>
                    感兴趣的研究领域
                </h3>
                <div className="grid grid-cols-1 gap-2">
                    {Object.values(InterestArea).map(area => (
                        <button
                            key={area}
                            onClick={() => handleInterestToggle(area)}
                            className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
                                formData.interests?.includes(area)
                                ? 'border-brand-500 bg-brand-50 text-brand-800 shadow-sm'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <span>{area}</span>
                            {formData.interests?.includes(area) && <CheckCircle className="w-4 h-4 text-brand-600" />}
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleSubmit}
                disabled={!formData.ageGroup || !formData.ambulatoryStatus || !formData.region}
                className="w-full flex items-center justify-center py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 disabled:opacity-50 shadow-lg shadow-brand-500/30 transition-all mt-4"
            >
                <Save className="w-5 h-5 mr-2" />
                {isInitialSetup ? '开始使用' : '保存设置'}
            </button>
        </div>
    </div>
  );
};