import { useEffect } from 'react';
import MobileLayout from '../components/Layout/MobileLayout';
import MobileCategoryGrid from '../components/Mobile/MobileCategoryGrid';
import { useCategoryStore } from '../../../shared/store/categoryStore';

const Categories = () => {
    const { initialize, isLoading } = useCategoryStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <MobileLayout title="Categories" showBack={true}>
            <div className="p-4 pb-20">
                <MobileCategoryGrid />
            </div>
        </MobileLayout>
    );
};

export default Categories;
