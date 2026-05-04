import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    RefreshCw,
    XCircle,
    Filter,
    Search,
    X,
    MoreVertical
} from 'lucide-react';
import Button from './Button';
import CustomSelect from './CustomSelect';


// DataTable component with filtering and grouping capabilities
export interface DataTableColumn<T> {
    header: string;
    accessorKey?: keyof T;
    render?: (item: T) => React.ReactNode;
    className?: string;
    filterable?: boolean;
    filterType?: 'text' | 'select' | 'date' | 'number';
    filterOptions?: { value: string; label: string }[];
}

export interface DataTableAction<T> {
    label?: string;
    icon?: React.ElementType;
    onClick: (item: T) => void;
    className?: string;
    title?: string;
    disabled?: boolean | ((item: T) => boolean);
}

export interface DataTableGroupOption<T> {
    value: string;
    label: string;
    getGroupKey: (item: T) => string;
    getGroupLabel?: (key: string) => string;
}

export interface DataTableFilter<T> {
    key: keyof T | string;
    label: string;
    type: 'text' | 'select' | 'date' | 'number';
    options?: { value: string; label: string }[];
    placeholder?: string;
}

export interface DataTableBulkAction<T> {
    label: string;
    icon?: React.ElementType;
    onClick: (selectedItems: T[]) => void;
    className?: string;
    disabled?: boolean | ((selectedItems: T[]) => boolean);
}

export interface DataTableHeaderButton {
    label: string;
    icon?: React.ElementType;
    onClick: () => void;
    className?: string;
    title?: string;
    disabled?: boolean;
}

export interface DataTableProps<T extends { id: string | number }> {
    data: T[];
    columns: DataTableColumn<T>[];
    actions?: DataTableAction<T>[] | ((item: T) => DataTableAction<T>[]);
    title?: string;
    titleIcon?: React.ElementType;
    isLoading?: boolean;
    error?: string | null;
    actionsLayout?: 'dropdown' | 'horizontal';
    onRefresh?: () => void;
    headerButtons?: DataTableHeaderButton[];

    // Selection
    enableSelection?: boolean;
    bulkActions?: DataTableBulkAction<T>[];
    onSelectionChange?: (selectedItems: T[]) => void;

    // Pagination
    pagination?: {
        total: number;
        limit: number;
        offset: number;
        onPageChange: (offset: number) => void;
    };

    // Grouping
    groupOptions?: DataTableGroupOption<T>[];
    defaultGroupBy?: string;

    // Filtering
    filters?: DataTableFilter<T>[];
    enableGlobalSearch?: boolean;
    globalSearchPlaceholder?: string;
    onFilterChange?: (filters: Record<string, unknown>) => void;

    // Custom renderers
    renderEmptyState?: () => React.ReactNode;
    renderGroupHeader?: (groupKey: string, groupLabel: string, items: T[], totals?: Record<string, unknown>) => React.ReactNode;
    calculateGroupTotals?: (items: T[]) => Record<string, unknown>;
    // Row interactions
    onRowClick?: (item: T) => void;

    // Initial state
    initialSelectedIds?: (string | number)[];
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    actions,
    title,
    titleIcon,
    isLoading,
    error,
    onRefresh,
    headerButtons = [],
    enableSelection = false,
    bulkActions = [],
    onSelectionChange,
    pagination,
    groupOptions = [],
    defaultGroupBy = 'none',
    filters = [],
    enableGlobalSearch = false,
    globalSearchPlaceholder = 'Buscar...',
    onFilterChange,
    renderGroupHeader,
    calculateGroupTotals,
    onRowClick,
    actionsLayout = 'dropdown',
    renderEmptyState,
    initialSelectedIds = []
}: DataTableProps<T>) {
    const [groupBy, setGroupBy] = useState<string>(defaultGroupBy);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [filterValues, setFilterValues] = useState<Record<string, string | number | undefined>>({});
    const [globalSearch, setGlobalSearch] = useState('');
    const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set(initialSelectedIds || []));

    // Update selected items if initialSelectedIds changes and selection is empty
    useEffect(() => {
        if (initialSelectedIds && initialSelectedIds.length > 0 && selectedItems.size === 0) {
            setSelectedItems(new Set(initialSelectedIds));
        }
    }, [initialSelectedIds]);
    const [openDropdownId, setOpenDropdownId] = useState<string | number | null>(null);
    const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number } | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const previousFilteredIdsRef = useRef<Set<string | number>>(new Set());
    const onSelectionChangeRef = useRef(onSelectionChange);

    // Update ref when callback changes
    useEffect(() => {
        onSelectionChangeRef.current = onSelectionChange;
    }, [onSelectionChange]);

    const toggleGroupExpansion = (groupKey: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupKey)) {
                newSet.delete(groupKey);
            } else {
                newSet.add(groupKey);
            }
            return newSet;
        });
    };

    const updateFilter = (key: string, value: string | number | undefined) => {
        const newFilters = { ...filterValues, [key]: value };
        setFilterValues(newFilters);
        if (onFilterChange) {
            onFilterChange(newFilters as Record<string, unknown>);
        }
    };

    const clearFilters = () => {
        setFilterValues({});
        setGlobalSearch('');
        if (onFilterChange) {
            onFilterChange({} as Record<string, unknown>);
        }
    };

    // Close dropdown when clicking outside or scrolling
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };

        const handleScroll = () => {
            if (openDropdownId !== null) {
                setOpenDropdownId(null);
            }
        };

        if (openDropdownId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [openDropdownId]);

    const filteredData = useMemo(() => {
        let result = [...data];

        // Apply global search - busca em todos os campos da base inteira
        if (globalSearch && enableGlobalSearch) {
            const searchLower = globalSearch.toLowerCase();
            result = result.filter(item => {
                // Buscar em todos os campos acessíveis
                const searchableFields: string[] = [];

                columns.forEach(col => {
                    if (col.accessorKey) {
                        const value = item[col.accessorKey];
                        if (value !== null && value !== undefined) {
                            searchableFields.push(String(value).toLowerCase());
                        }
                    }
                });

                // Buscar também em campos comuns do objeto
                Object.keys(item).forEach(key => {
                    const value = (item as Record<string, unknown>)[key];
                    if (value !== null && value !== undefined && typeof value !== 'object') {
                        const valueStr = String(value).toLowerCase();
                        if (!searchableFields.includes(valueStr)) {
                            searchableFields.push(valueStr);
                        }
                    }
                });

                // Verificar se algum campo contém o termo de busca
                return searchableFields.some(field => field.includes(searchLower));
            });
        }

        // Apply column filters
        filters.forEach(filter => {
            const filterKey = String(filter.key);
            const filterValue = filterValues[filterKey];
            if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
                result = result.filter(item => {
                    const itemValue = (item as Record<string, unknown>)[filterKey];
                    if (filter.type === 'text') {
                        return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
                    } else if (filter.type === 'number') {
                        return Number(itemValue) === Number(filterValue);
                    } else if (filter.type === 'date') {
                        return String(itemValue).startsWith(String(filterValue));
                    } else if (filter.type === 'select') {
                        return String(itemValue) === String(filterValue);
                    }
                    return true;
                });
            }
        });

        return result;
    }, [data, filterValues, globalSearch, enableGlobalSearch, filters, columns]);

    // Clean up selection when filtered data changes (silently, without notifying parent)
    useEffect(() => {
        if (!enableSelection) return;

        const filteredIds = new Set(filteredData.map(item => item.id));
        const filteredIdsStr = Array.from(filteredIds).sort().join(',');
        const previousIdsStr = Array.from(previousFilteredIdsRef.current).sort().join(',');

        // Only clean up if the set of available IDs has actually changed
        if (filteredIdsStr !== previousIdsStr) {
            previousFilteredIdsRef.current = new Set(filteredIds);

            setSelectedItems(prev => {
                // Check if cleanup is needed
                let needsCleanup = false;
                for (const id of prev) {
                    if (!filteredIds.has(id)) {
                        needsCleanup = true;
                        break;
                    }
                }

                if (!needsCleanup) {
                    return prev; // No changes needed
                }

                // Clean up invalid selections silently (don't notify parent to avoid loops)
                const cleaned = new Set<string | number>();
                prev.forEach(id => {
                    if (filteredIds.has(id)) {
                        cleaned.add(id);
                    }
                });

                return cleaned;
            });
        }
    }, [filteredData, enableSelection]);

    // Apply pagination to filtered data (before grouping)
    const paginatedData = useMemo(() => {
        if (!pagination) {
            return filteredData;
        }
        return filteredData.slice(pagination.offset, pagination.offset + pagination.limit);
    }, [filteredData, pagination]);

    const groupedData = useMemo(() => {
        if (groupBy === 'none' || !groupOptions.length) {
            return { ungrouped: paginatedData };
        }

        const groupOption = groupOptions.find(opt => opt.value === groupBy);
        if (!groupOption) {
            return { ungrouped: paginatedData };
        }

        const grouped: Record<string, T[]> = {};
        paginatedData.forEach(item => {
            const key = groupOption.getGroupKey(item) || 'Sem grupo';
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(item);
        });

        return grouped;
    }, [paginatedData, groupBy, groupOptions]);

    const getNextPage = () => {
        if (pagination && paginatedData.length === pagination.limit && pagination.offset + pagination.limit < filteredData.length) {
            pagination.onPageChange(pagination.offset + pagination.limit);
        }
    };

    const getPreviousPage = () => {
        if (pagination) {
            pagination.onPageChange(Math.max(0, pagination.offset - pagination.limit));
        }
    };

    // Selection handlers
    const toggleItemSelection = (itemId: string | number) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }

            // Notify parent of selection change (use ref to avoid dependency issues)
            if (onSelectionChangeRef.current) {
                const selected = filteredData.filter(item => newSet.has(item.id));
                // Use requestAnimationFrame to ensure state update is complete
                requestAnimationFrame(() => {
                    onSelectionChangeRef.current?.(selected);
                });
            }

            return newSet;
        });
    };

    const toggleSelectAll = () => {
        const allSelected = filteredData.length > 0 && selectedItems.size === filteredData.length;

        if (allSelected) {
            setSelectedItems(new Set());
            if (onSelectionChangeRef.current) {
                requestAnimationFrame(() => {
                    onSelectionChangeRef.current?.([]);
                });
            }
        } else {
            const allIds = new Set(filteredData.map(item => item.id));
            setSelectedItems(allIds);
            if (onSelectionChangeRef.current) {
                requestAnimationFrame(() => {
                    onSelectionChangeRef.current?.(filteredData);
                });
            }
        }
    };

    const isItemSelected = (itemId: string | number) => selectedItems.has(itemId);
    const isAllSelected = filteredData.length > 0 && selectedItems.size === filteredData.length;
    const isIndeterminate = selectedItems.size > 0 && selectedItems.size < filteredData.length;

    const renderRow = (item: T) => {
        const itemActions = typeof actions === 'function' ? actions(item) : actions;
        const hasActions = itemActions && itemActions.length > 0;
        const isSelected = isItemSelected(item.id);

        return (
            <tr
                key={item.id}
                className={`border-b border-border-strong/5 hover:bg-secondary/5 transition-colors group/row cursor-pointer ${isSelected ? 'bg-secondary/10' : ''}`}
                onClick={() => {
                    if (typeof onRowClick === 'function') {
                        onRowClick(item);
                    }
                }}
            >
                {enableSelection && (
                    <td className="px-6 py-2" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-3.5 h-3.5 bg-panel-bg border-border-strong/30 text-secondary focus:ring-0 rounded-none cursor-pointer"
                            aria-label="Selecionar item"
                        />
                    </td>
                )}
                {columns.map((col, colIdx) => (
                    <td
                        key={colIdx}
                        className={`px-6 py-2 text-[11px] font-bold text-foreground/80 tracking-wider ${col.className || ''}`}
                    >
                        {col.render ? col.render(item) : (item[col.accessorKey as keyof T] as React.ReactNode)}
                    </td>
                ))}
                {hasActions && (
                    <td className="px-6 py-2 text-right">
                        <div className="flex justify-end items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            {actionsLayout === 'horizontal' ? (
                                itemActions!.map((action, actionIdx) => {
                                    const isDisabled = typeof action.disabled === 'function'
                                        ? action.disabled(item)
                                        : action.disabled || false;
                                    const IconComponent = action.icon;
                                    return (
                                        <button
                                            key={actionIdx}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                if (!isDisabled) {
                                                    action.onClick(item);
                                                }
                                            }}
                                            disabled={isDisabled}
                                            className={`p-1 border border-border-strong/20 hover:border-secondary hover:text-secondary transition-all ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                            title={action.title || action.label}
                                        >
                                            {IconComponent && <IconComponent size={13} />}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const menuWidth = 160;
                                            const windowHeight = window.innerHeight;
                                            const windowWidth = window.innerWidth;

                                            const estimatedMenuHeight = (itemActions?.length || 0) * 36;
                                            
                                            // Calcular posição horizontal (alinhar à direita do botão)
                                            let left = rect.right - menuWidth;
                                            if (left < 10) left = 10; // Evitar sair da tela à esquerda

                                            // Calcular posição vertical
                                            let top = rect.bottom;
                                            if (rect.bottom + estimatedMenuHeight > windowHeight) {
                                                top = rect.top - estimatedMenuHeight;
                                            }

                                            setDropdownRect({ top, left });
                                            setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                                        }}
                                        className="p-1 border border-border-strong/20 hover:border-secondary hover:text-secondary transition-all"
                                    >
                                        <MoreVertical size={13} />
                                    </button>

                                    {openDropdownId === item.id && dropdownRect && (
                                        <div
                                            ref={dropdownRef}
                                            style={{
                                                position: 'fixed',
                                                left: dropdownRect.left,
                                                top: dropdownRect.top,
                                                zIndex: 9999
                                            }}
                                            className="w-40 bg-panel-bg border border-border-strong/30 shadow-2xl py-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {itemActions!.map((action, actionIdx) => {
                                                const isDisabled = typeof action.disabled === 'function'
                                                    ? action.disabled(item)
                                                    : action.disabled || false;
                                                const IconComponent = action.icon;
                                                return (
                                                    <button
                                                        key={actionIdx}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            if (!isDisabled) {
                                                                action.onClick(item);
                                                                setOpenDropdownId(null);
                                                            }
                                                        }}
                                                        disabled={isDisabled}
                                                        className={`flex w-full items-center px-3 py-2 text-[10px] font-black tracking-widest hover:bg-secondary/10 hover:text-secondary transition-colors ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                    >
                                                        {IconComponent && <IconComponent size={12} className="mr-2" />}
                                                        {action.title || action.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </td>
                )}
            </tr>
        );
    };

    return (
        <div id="data-grid-container" className="flex flex-col h-full min-h-0 bg-transparent">
            {/* Header */}
            {(title || onRefresh || headerButtons.length > 0) && (() => {
                const TitleIconComponent = titleIcon;
                return (
                    <div className="flex justify-between items-center gap-4 bg-transparent border-b border-border-strong/20 px-4 py-3 shrink-0">
                        {title && (
                            <div className="flex items-center gap-3">
                                {TitleIconComponent && (
                                    <div className="w-8 h-8 bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/10">
                                        <TitleIconComponent size={18} />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <h3 className="text-xs font-black tracking-widest text-foreground">
                                        {title}
                                    </h3>
                                    <span className="text-[8px] font-mono text-foreground/100 tracking-[0.2em]">
                                        SYSTEM_LISTING_V2
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {headerButtons.map((button, idx) => {
                                const IconComponent = button.icon;
                                return (
                                    <Button
                                        key={idx}
                                        onClick={button.onClick}
                                        disabled={button.disabled}
                                        variant="primary"
                                        size="sm"
                                        className={button.className}
                                        title={button.title}
                                    >
                                        {IconComponent && <IconComponent className="h-3 w-3" />}
                                        {button.label}
                                    </Button>
                                );
                            })}
                            {onRefresh && (
                                <Button
                                    onClick={onRefresh}
                                    variant="secondary"
                                    size="sm"
                                    title="Atualizar dados"
                                    aria-label="Atualizar lista"
                                    loading={isLoading}
                                >
                                    <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                                    
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Error Message */}
            {error && (
                <div className="border border-red-500/30 bg-red-500/5 p-3 mx-4 mt-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <XCircle className="h-4 w-4 text-red-500/70" />
                        <div className="flex flex-col">
                            <h3 className="text-[10px] font-black text-red-500/70 tracking-widest">
                                ERROR_ENCOUNTERED
                            </h3>
                            <div className="text-[9px] font-bold text-red-400/60">
                                {error}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Actions Bar */}
            {enableSelection && selectedItems.size > 0 && bulkActions.length > 0 && (
                <div className="mx-4 bg-secondary/5 border border-secondary/10 p-2 mt-3 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-secondary/60 animate-pulse" />
                            <span className="text-[10px] font-black text-secondary/70 tracking-widest">
                                {selectedItems.size} {selectedItems.size === 1 ? 'ITEM_SELECTED' : 'ITEMS_SELECTED'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {bulkActions.map((action, idx) => {
                                const IconComponent = action.icon;
                                const selected = filteredData.filter(item => selectedItems.has(item.id));
                                const isDisabled = typeof action.disabled === 'function'
                                    ? action.disabled(selected)
                                    : action.disabled || false;
                                return (
                                    <Button
                                        key={idx}
                                        onClick={() => {
                                            if (!isDisabled) {
                                                action.onClick(selected);
                                            }
                                        }}
                                        disabled={isDisabled}
                                        variant="outline"
                                        size="sm"
                                        className={action.className}
                                    >
                                        {IconComponent && <IconComponent className="h-3 w-3" />}
                                        {action.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters, Search and Grouping - Linha única */}
            {(filters.length > 0 || enableGlobalSearch || groupOptions.length > 0) && (
                <div className="mx-4 bg-panel-bg/30 p-2 mt-3 shrink-0 border border-border-strong/10">
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Filtros */}
                        {filters.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => setShowFilters(!showFilters)}
                                    variant={showFilters ? 'secondary' : 'outline'}
                                    size="sm"
                                >
                                    <Filter className="h-3 w-3" />
                                    FILTERS
                                </Button>
                                {(Object.keys(filterValues).length > 0 || globalSearch) && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-[9px] font-black text-foreground/100 hover:text-secondary tracking-widest transition-colors"
                                    >
                                        CLEAR_ALL
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Busca Global */}
                        {enableGlobalSearch && (
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/20 group-focus-within:text-secondary transition-colors" />
                                    <input
                                        type="text"
                                        value={globalSearch}
                                        onChange={(e) => {
                                            setGlobalSearch(e.target.value);
                                            if (pagination && e.target.value) {
                                                pagination.onPageChange(0);
                                            }
                                        }}
                                        placeholder={globalSearchPlaceholder}
                                        className="w-full pl-9 pr-9 py-1.5 bg-panel-bg/30 border border-border-strong/10 text-foreground text-[10px] font-bold tracking-widest focus:outline-none focus:border-secondary/40 transition-all placeholder:text-foreground/10"
                                    />
                                    {globalSearch && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setGlobalSearch('');
                                                if (pagination) {
                                                    pagination.onPageChange(0);
                                                }
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-red-500 transition-colors"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Agrupamento */}
                        {groupOptions.length > 0 && (
                            <div className="flex items-center gap-2">
                                <label className="text-[9px] font-black text-foreground/100 tracking-widest">
                                    GROUP_BY:
                                </label>
                                <div className="w-40">
                                    <CustomSelect
                                        options={[
                                            { id: 'none', label: 'NONE' },
                                            ...groupOptions.map(opt => ({ id: opt.value, label: opt.label }))
                                        ]}
                                        value={groupBy}
                                        onChange={(val) => setGroupBy(val)}
                                        searchable={false}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filters Panel - Expandido */}
                    {showFilters && filters.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-2 border-t border-border-strong/10">
                            {filters.map(filter => (
                                <div key={String(filter.key)} className="space-y-1">
                                    <label className="text-[9px] font-black text-foreground/100 tracking-widest">
                                        {filter.label}
                                    </label>
                                    {filter.type === 'select' && filter.options ? (
                                        <CustomSelect
                                            options={filter.options.map(opt => ({ id: opt.value, label: opt.label }))}
                                            value={String(filterValues[String(filter.key)] || '')}
                                            onChange={(val) => updateFilter(String(filter.key), val || undefined)}
                                            placeholder="ALL"
                                            searchable={false}
                                        />
                                    ) : filter.type === 'date' ? (
                                        <input
                                            type="date"
                                            value={filterValues[String(filter.key)] || ''}
                                            onChange={(e) => updateFilter(String(filter.key), e.target.value || undefined)}
                                            className="w-full bg-panel-bg/30 border border-border-strong/10 text-foreground text-[10px] font-bold tracking-widest px-3 py-1.5 focus:outline-none focus:border-secondary/40 transition-all"
                                        />
                                    ) : (
                                        <input
                                            type={filter.type === 'number' ? 'number' : 'text'}
                                            value={filterValues[String(filter.key)] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                updateFilter(String(filter.key), filter.type === 'number' ? (val ? Number(val) : undefined) : (val || undefined));
                                            }}
                                            placeholder={filter.placeholder}
                                            className="w-full bg-panel-bg/30 border border-border-strong/10 text-foreground text-[10px] font-bold tracking-widest px-3 py-1.5 focus:outline-none focus:border-secondary/40 transition-all placeholder:text-foreground/10"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Table Area - Expandível */}
            <div className="flex-1 min-h-0 overflow-y-auto mt-3 relative scrollbar-hide">
                <table className="min-w-full border-collapse">
                    <thead className="sticky top-0 z-10 bg-panel-bg shadow-sm">
                        <tr className="border-b border-border-strong/20">
                            {enableSelection && (
                                <th className="px-6 py-3 text-left">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            ref={(input) => {
                                                if (input) input.indeterminate = isIndeterminate;
                                            }}
                                            onChange={toggleSelectAll}
                                            className="w-3.5 h-3.5 bg-panel-bg border-border-strong/30 text-secondary focus:ring-0 rounded-none cursor-pointer"
                                        />
                                    </div>
                                </th>
                            )}
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-3 text-left text-[10px] font-black text-foreground/100 tracking-widest ${col.className || ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-0.5 h-3 bg-secondary/20" />
                                        {col.header}
                                    </div>
                                </th>
                            ))}
                            {actions && (
                                <th className="px-6 py-3 text-right text-[10px] font-black text-foreground/100 tracking-widest">
                                    ACTIONS
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-strong/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 2 : 1)} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <RefreshCw className="h-6 w-6 text-secondary/40 animate-spin" />
                                        <span className="text-[10px] font-black text-foreground/20 tracking-[0.3em]">
                                            SYNCHRONIZING_DATA...
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (enableSelection ? 1 : 0) + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 opacity-20">
                                        <div className="text-[10px] font-black tracking-[0.2em]">
                                            {renderEmptyState ? renderEmptyState() : 'NO_RECORDS_LOCATED'}
                                        </div>
                                        <div className="w-8 h-0.5 bg-foreground/20" />
                                    </div>
                                </td>
                            </tr>
                        ) : groupBy === 'none' ? (
                            paginatedData.map(item => renderRow(item))
                        ) : (
                            Object.entries(groupedData).map(([groupKey, groupItems]) => {
                                const isExpanded = expandedGroups.has(groupKey);
                                const groupOption = groupOptions.find(opt => opt.value === groupBy);
                                const groupLabel = groupOption?.getGroupLabel
                                    ? groupOption.getGroupLabel(groupKey)
                                    : groupKey;
                                const totals = calculateGroupTotals ? calculateGroupTotals(groupItems) : undefined;

                                return (
                                    <React.Fragment key={groupKey}>
                                        <tr className="bg-panel-bg/10 border-l-2 border-l-secondary/30">
                                            <td colSpan={columns.length + (enableSelection ? 1 : 0) + (actions ? 1 : 0)} className="px-6 py-2">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => toggleGroupExpansion(groupKey)}
                                                        className="w-5 h-5 flex items-center justify-center text-secondary/40 hover:bg-secondary/10 transition-colors"
                                                    >
                                                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                                                    </button>
                                                    {renderGroupHeader ? (
                                                        renderGroupHeader(groupKey, groupLabel, groupItems, totals)
                                                    ) : (
                                                        <div className="flex items-center justify-between flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-black text-foreground/30 tracking-widest">
                                                                    {groupOption?.label}:
                                                                </span>
                                                                <span className="text-[10px] font-black text-foreground/70">
                                                                    {groupLabel}
                                                                </span>
                                                                <div className="w-4 h-[1px] bg-border-strong/10" />
                                                                <span className="text-[9px] font-mono text-secondary/40">
                                                                    COUNT[{groupItems.length}]
                                                                </span>
                                                            </div>
                                                            {totals && (
                                                                <div className="flex gap-4">
                                                                    {Object.entries(totals).map(([key, value]) => (
                                                                        <div key={key} className="flex items-center gap-1.5">
                                                                            <span className="text-[8px] font-black text-foreground/20">{key}</span>
                                                                            <span className="text-[9px] font-mono font-bold text-secondary/40">{String(value)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && groupItems.map(item => renderRow(item))}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination - Fixo no rodapé */}
            {pagination && paginatedData.length > 0 && (
                <div className="bg-transparent border-t border-border-strong/10 px-4 py-3 flex items-center justify-between shrink-0">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <Button
                            onClick={getPreviousPage}
                            disabled={pagination.offset === 0}
                            variant="outline"
                            size="sm"
                        >
                            PREVIOUS
                        </Button>
                        <Button
                            onClick={getNextPage}
                            disabled={pagination.offset + pagination.limit >= filteredData.length}
                            variant="outline"
                            size="sm"
                        >
                            NEXT
                        </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[9px] font-black text-foreground/30 tracking-widest">
                                SHOWING <span className="text-foreground/60">{pagination.offset + 1}</span> TO{' '}
                                <span className="text-foreground/60">{Math.min(pagination.offset + paginatedData.length, filteredData.length)}</span> OF{' '}
                                <span className="text-secondary/60">{filteredData.length}</span> DATA_UNITS
                                {filteredData.length !== data.length && (
                                    <span className="ml-2 opacity-30">
                                        (FILTERED_FROM_{data.length})
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 mr-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-1 h-1 bg-secondary/10" />
                                ))}
                            </div>
                            <nav className="flex items-center gap-1">
                                <Button
                                    onClick={getPreviousPage}
                                    disabled={pagination.offset === 0}
                                    variant="outline"
                                    size="sm"
                                    className="px-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={getNextPage}
                                    disabled={pagination.offset + pagination.limit >= filteredData.length}
                                    variant="outline"
                                    size="sm"
                                    className="px-2"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
