import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import { Header, toast } from '@shared';
import { addressAPI } from '../api';

export default function AddressPage({ onBack }: { onBack: () => void }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response: any = await addressAPI.list();
      if (response.code === 0) {
        setAddresses(response.data.items);
      }
    } catch (error) {
      toast('加载地址失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressAPI.setDefault(id);
      toast('设置成功');
      loadAddresses();
    } catch (error) {
      toast('设置失败');
    }
  };

  return (
    <div className="w-full min-h-screen pt-14 bg-[#F5F5F5]">
      <Header title="收货地址" onBack={onBack} />

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#0085FF]" size={32} />
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 text-gray-400">暂无地址</div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {addr.tag && <span className="px-2 py-0.5 bg-blue-50 text-[#0085FF] text-xs rounded">{addr.tag}</span>}
                    <span className="font-bold">{addr.contact_name}</span>
                    <span className="text-gray-600">{addr.contact_phone}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{addr.address}</p>
                </div>
                {!addr.is_default && (
                  <button 
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[#0085FF] text-sm"
                  >
                    设为默认
                  </button>
                )}
                {addr.is_default && (
                  <span className="text-[#0085FF] text-sm">默认</span>
                )}
              </div>
            </div>
          ))
        )}

        <button className="w-full py-4 bg-white rounded-2xl text-[#0085FF] font-bold flex items-center justify-center gap-2">
          <Plus size={20} />
          新增地址
        </button>
      </div>
    </div>
  );
}
